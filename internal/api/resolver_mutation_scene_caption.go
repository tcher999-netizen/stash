package api

import (
	"context"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/99designs/gqlgen/graphql"
	"github.com/stashapp/stash/pkg/file/video"
	"github.com/stashapp/stash/pkg/models"
)

type SceneUploadCaptionInput struct {
	SceneID      string         `json:"scene_id"`
	CaptionFile  graphql.Upload `json:"caption_file"`
	LanguageCode *string        `json:"language_code"`
}

func (r *mutationResolver) SceneUploadCaption(ctx context.Context, input SceneUploadCaptionInput) (*models.Scene, error) {
	// Parse scene ID
	sceneID, err := strconv.Atoi(input.SceneID)
	if err != nil {
		return nil, fmt.Errorf("invalid scene ID: %w", err)
	}

	// Validate uploaded file
	if input.CaptionFile.File == nil {
		return nil, errors.New("no caption file provided")
	}

	filename := input.CaptionFile.Filename
	if filename == "" {
		return nil, errors.New("caption file has no filename")
	}

	// Validate file extension
	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		return nil, errors.New("caption file has no extension")
	}
	ext = ext[1:] // remove the leading dot

	isValidExt := false
	for _, validExt := range video.CaptionExts {
		if ext == validExt {
			isValidExt = true
			break
		}
	}
	if !isValidExt {
		return nil, fmt.Errorf("invalid caption file type: %s (must be .srt or .vtt)", ext)
	}

	var scene *models.Scene
	var videoFile *models.VideoFile

	// Get scene and its primary video file
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		var err error
		scene, err = r.repository.Scene.Find(ctx, sceneID)
		if err != nil {
			return fmt.Errorf("finding scene: %w", err)
		}
		if scene == nil {
			return errors.New("scene not found")
		}

		// Load scene files
		if err := scene.LoadPrimaryFile(ctx, r.repository.File); err != nil {
			return fmt.Errorf("loading scene files: %w", err)
		}

		videoFile = scene.Files.Primary()
		if videoFile == nil {
			return errors.New("scene has no primary file")
		}

		return nil
	}); err != nil {
		return nil, err
	}

	// Determine language code
	languageCode := "en" // default to English
	if input.LanguageCode != nil && *input.LanguageCode != "" {
		languageCode = *input.LanguageCode
	} else {
		// Try to extract from filename
		extractedLang := extractLanguageFromFilename(filename)
		if extractedLang != "" {
			languageCode = extractedLang
		}
	}

	// Validate language code
	if languageCode != video.LangUnknown && !video.IsValidLanguage(languageCode) {
		return nil, fmt.Errorf("invalid language code: %s (must be ISO 639-1 format)", languageCode)
	}

	// Generate caption filename following the naming convention
	videoPath := videoFile.Path
	videoBasename := strings.TrimSuffix(filepath.Base(videoPath), filepath.Ext(videoPath))

	var captionFilename string
	if languageCode == video.LangUnknown {
		captionFilename = fmt.Sprintf("%s.%s", videoBasename, ext)
	} else {
		captionFilename = fmt.Sprintf("%s.%s.%s", videoBasename, languageCode, ext)
	}

	captionPath := filepath.Join(filepath.Dir(videoPath), captionFilename)

	// Check if caption with same language and type already exists
	var existingCaptions []*models.VideoCaption
	if err := r.withReadTxn(ctx, func(ctx context.Context) error {
		var err error
		existingCaptions, err = r.repository.File.GetCaptions(ctx, videoFile.ID)
		return err
	}); err != nil {
		return nil, fmt.Errorf("getting existing captions: %w", err)
	}

	captionExists := video.IsLangInCaptions(languageCode, ext, existingCaptions)
	if captionExists {
		// Check if the file already exists on disk
		if _, err := os.Stat(captionPath); err == nil {
			// File exists, this is a replacement - we'll overwrite it
			// Note: Frontend should handle confirmation before calling this mutation
		}
	}

	// Save the uploaded file to disk
	outFile, err := os.Create(captionPath)
	if err != nil {
		return nil, fmt.Errorf("creating caption file: %w", err)
	}
	defer outFile.Close()

	_, err = io.Copy(outFile, input.CaptionFile.File)
	if err != nil {
		// Clean up the file if copy failed
		os.Remove(captionPath)
		return nil, fmt.Errorf("saving caption file: %w", err)
	}

	// Validate the caption file by trying to read it
	if _, err := video.ReadSubs(captionPath); err != nil {
		// Clean up the invalid file
		os.Remove(captionPath)
		return nil, fmt.Errorf("invalid caption file format: %w", err)
	}

	// Update database
	var updatedCaptions []*models.VideoCaption
	if captionExists {
		// Replace existing caption with same language and type
		for _, cap := range existingCaptions {
			if cap.LanguageCode == languageCode && cap.CaptionType == ext {
				// Update the filename in case it changed
				cap.Filename = captionFilename
				updatedCaptions = append(updatedCaptions, cap)
			} else {
				updatedCaptions = append(updatedCaptions, cap)
			}
		}
	} else {
		// Add new caption
		updatedCaptions = existingCaptions
		newCaption := &models.VideoCaption{
			LanguageCode: languageCode,
			Filename:     captionFilename,
			CaptionType:  ext,
		}
		updatedCaptions = append(updatedCaptions, newCaption)
	}

	// Update captions in database
	if err := r.withTxn(ctx, func(ctx context.Context) error {
		return r.repository.File.UpdateCaptions(ctx, videoFile.ID, updatedCaptions)
	}); err != nil {
		// Try to clean up the file on database error
		os.Remove(captionPath)
		return nil, fmt.Errorf("updating captions in database: %w", err)
	}

	// Return the updated scene
	updatedScene, err := r.getScene(ctx, sceneID)
	if err != nil {
		return nil, fmt.Errorf("retrieving updated scene: %w", err)
	}

	return updatedScene, nil
}

// extractLanguageFromFilename attempts to extract language code from filename
// e.g., "subtitle.en.srt" -> "en"
func extractLanguageFromFilename(filename string) string {
	basename := strings.TrimSuffix(filename, filepath.Ext(filename))
	langExt := filepath.Ext(basename)

	if len(langExt) > 1 {
		lang := langExt[1:] // remove the leading dot
		if video.IsValidLanguage(lang) {
			return lang
		}
	}

	return ""
}
