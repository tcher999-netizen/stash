import React, { useMemo } from "react";
import { CriterionModifier } from "../../../core/generated-graphql";
import { CriterionOption } from "../../../models/list-filter/criteria/criterion";
import { NumberCriterion } from "src/models/list-filter/criteria/criterion";
import { ListFilterModel } from "src/models/list-filter/filter";
import { Option, SidebarListFilter } from "./SidebarListFilter";

interface ISidebarCountFilter {
  title?: React.ReactNode;
  option: CriterionOption;
  filter: ListFilterModel;
  setFilter: (f: ListFilterModel) => void;
  sectionID?: string;
}

// Simple count options - covers 95% of use cases
const COUNT_OPTIONS = [
  { id: "0", label: "0", value: 0, modifier: CriterionModifier.Equals },
  { id: "1", label: "1", value: 1, modifier: CriterionModifier.Equals },
  { id: "2", label: "2", value: 2, modifier: CriterionModifier.Equals },
  { id: "3", label: "3", value: 3, modifier: CriterionModifier.Equals },
  { id: "4+", label: "4+", value: 3, modifier: CriterionModifier.GreaterThan },
];

export const SidebarCountFilter: React.FC<ISidebarCountFilter> = ({
  title,
  option,
  filter,
  setFilter,
  sectionID,
}) => {
  const criteria = filter.criteriaFor(option.type) as NumberCriterion[];
  const criterion = criteria.length > 0 ? criteria[0] : null;

  // Find which option matches current criterion
  const selectedOptionId = useMemo(() => {
    if (!criterion) return null;

    for (const opt of COUNT_OPTIONS) {
      if (
        criterion.modifier === opt.modifier &&
        criterion.value.value === opt.value
      ) {
        return opt.id;
      }
    }
    return null;
  }, [criterion]);

  const options: Option[] = useMemo(() => {
    return COUNT_OPTIONS.map((opt) => ({
      id: opt.id,
      label: opt.label,
    }));
  }, []);

  const selected: Option[] = useMemo(() => {
    if (!selectedOptionId) return [];
    const opt = COUNT_OPTIONS.find((o) => o.id === selectedOptionId);
    if (opt) {
      return [{ id: opt.id, label: opt.label }];
    }
    return [];
  }, [selectedOptionId]);

  function onSelect(item: Option) {
    const opt = COUNT_OPTIONS.find((o) => o.id === item.id);
    if (!opt) return;

    const newCriterion = criterion
      ? criterion.clone()
      : option.makeCriterion();

    newCriterion.modifier = opt.modifier;
    newCriterion.value.value = opt.value;
    newCriterion.value.value2 = undefined;

    setFilter(filter.replaceCriteria(option.type, [newCriterion]));
  }

  function onUnselect() {
    setFilter(filter.removeCriterion(option.type));
  }

  return (
    <SidebarListFilter
      title={title}
      candidates={options}
      onSelect={onSelect}
      onUnselect={onUnselect}
      selected={selected}
      singleValue
      sectionID={sectionID}
    />
  );
};
