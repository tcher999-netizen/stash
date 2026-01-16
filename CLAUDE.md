# My Stashapp Fork

Custom fork of stashapp/stash with additional features.

## Custom Features

1. **Persistent Queue/Playlist** - Add videos to a queue that persists until watched, with drag-and-drop reordering
2. **Caption Upload** - Upload .srt/.vtt caption files to scenes

## Repository Setup

- **Origin**: `git@github-tcher999:tcher999-netizen/stash.git` (your fork)
- **Upstream**: `https://github.com/stashapp/stash.git` (official repo)

## Rebuild & Redeploy Commands

```bash
# Single command to rebuild and redeploy
cd /home/claudedev/stash/my-stashapp && sudo make docker-build && sudo docker tag stash/build my-stashapp:latest && cd /opt/stashapp && sudo docker-compose down && sudo docker-compose up -d
```

Or step by step:
```bash
# 1. Rebuild the Docker image
cd /home/claudedev/stash/my-stashapp
sudo make docker-build

# 2. Tag the new image
sudo docker tag stash/build my-stashapp:latest

# 3. Restart the container
cd /opt/stashapp
sudo docker-compose down
sudo docker-compose up -d
```

## Sync with Upstream

To pull latest changes from official stashapp:
```bash
cd /home/claudedev/stash/my-stashapp
git fetch upstream
git merge upstream/develop
# Resolve any conflicts
git push origin develop
# Then rebuild and redeploy (see above)
```

## Deployment Info

- **Container location**: `/opt/stashapp/`
- **Config/data**: `/opt/stashapp/config/`
- **Port**: 9999
- **Image**: `my-stashapp:latest`

## SSH Config

Uses `~/.ssh/config` with host alias `github-tcher999` for the tcher999-netizen account.
