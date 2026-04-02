import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import Select, { StylesConfig, components } from "react-select";
import { usePlaylists, PlaylistData } from "src/hooks/usePlaylist";

interface IProps {
  value?: string | string[];
  onChange: (playlistId: string | string[] | undefined) => void;
  isMulti?: boolean;
  isClearable?: boolean;
  placeholder?: string;
  excludeIds?: string[];
  menuPortalTarget?: HTMLElement;
  className?: string;
}

interface PlaylistOption {
  value: string;
  label: string;
  isDefault: boolean;
}

const customStyles: StylesConfig<PlaylistOption, boolean> = {
  option: (provided, state) => ({
    ...provided,
    fontWeight: state.data.isDefault ? "bold" : "normal",
  }),
};

const Option = (props: any) => {
  return (
    <components.Option {...props}>
      {props.data.label}
      {props.data.isDefault && (
        <span className="ml-2 badge badge-info badge-sm">Default</span>
      )}
    </components.Option>
  );
};

export const PlaylistSelect: React.FC<IProps> = ({
  value,
  onChange,
  isMulti = false,
  isClearable = true,
  placeholder,
  excludeIds = [],
  menuPortalTarget,
  className,
}) => {
  const intl = useIntl();
  const { playlists, loading } = usePlaylists();

  const options = useMemo(() => {
    return playlists
      .filter((p) => !excludeIds.includes(p.id))
      .map((p) => ({
        value: p.id,
        label: p.name,
        isDefault: p.is_default,
      }));
  }, [playlists, excludeIds]);

  const selectedValue = useMemo(() => {
    if (isMulti) {
      const values = Array.isArray(value) ? value : value ? [value] : [];
      return options.filter((o) => values.includes(o.value));
    }
    return options.find((o) => o.value === value) || null;
  }, [value, options, isMulti]);

  const handleChange = (selected: any) => {
    if (isMulti) {
      const values = selected ? selected.map((s: PlaylistOption) => s.value) : [];
      onChange(values.length > 0 ? values : undefined);
    } else {
      onChange(selected?.value || undefined);
    }
  };

  return (
    <Select<PlaylistOption, boolean>
      classNamePrefix="react-select"
      className={className}
      options={options}
      value={selectedValue}
      onChange={handleChange}
      isLoading={loading}
      isMulti={isMulti}
      isClearable={isClearable}
      placeholder={
        placeholder || intl.formatMessage({ id: "playlist.select_placeholder" })
      }
      noOptionsMessage={() =>
        intl.formatMessage({ id: "playlist.no_playlists" })
      }
      styles={customStyles}
      components={{ Option }}
      menuPortalTarget={menuPortalTarget}
    />
  );
};

export default PlaylistSelect;
