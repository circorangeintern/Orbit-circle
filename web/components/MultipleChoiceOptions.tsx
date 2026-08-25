'use client';

import styled from "styled-components";
import colors from "@/lib/colors";

import type { QuizOption } from "@/hooks/quiz.hook";

const NOTA_LABEL = "None of the above";

// Matches the backend's own check exactly (quizScoringService.ts) --
// matched by label, not position, since NOTA's index varies per question
// depending on how many real options that question has.
const isNota = (option: QuizOption) => option.label === NOTA_LABEL;

const Options = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 36px auto;
  width: 100%;
  max-width: 480px;

  @media (max-width: 860px) {
    margin: 24px 0;
    gap: 12px;
  }
`;

const Option = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  width: 100%;
  text-align: left;
  padding: 16px 20px;
  border-radius: 14px;
  background: rgba(119, 59, 236, 0.12);
  border: 1px solid
    ${(p) => (p.$selected ? colors.buttonPurple : "rgba(119,59,236,0.25)")};
  color: ${colors.normalWhite};
  font-family: inherit;
  font-size: 16px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;

  &:hover {
    background: rgba(119, 59, 236, 0.22);
  }

  @media (max-width: 860px) {
    padding: 14px 16px;
    font-size: 14px;
  }
`;

// square instead of the single-choice page's circular Radio, signaling
// "select multiple" at a glance
const Checkbox = styled.span<{ $selected: boolean }>`
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: 6px;
  border: 2px solid
    ${(p) => (p.$selected ? colors.normalWhite : "rgba(185,179,214,0.7)")};
  background: ${(p) => (p.$selected ? colors.normalWhite : "transparent")};
  box-shadow: ${(p) => (p.$selected ? `0 0 0 3px ${colors.buttonPurple}` : "none")};

  @media (max-width: 860px) {
    width: 18px;
    height: 18px;
  }
`;

const HelperText = styled.p`
  margin: 20px 0 4px;
  font-size: 13px;
  color: ${colors.muted};
`;

interface MultipleChoiceOptionsProps {
  options: QuizOption[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  maxSelections?: number; // matches whatever "choose up to N" the question text says
}

export function MultipleChoiceOptions({
  options,
  selectedIds,
  onChange,
  maxSelections
}: MultipleChoiceOptionsProps) {
  const handleToggle = (option: QuizOption) => {
    const alreadySelected = selectedIds.includes(option.id);

    if (isNota(option)) {
      // selecting NOTA clears everything else; deselecting it just removes itself
      onChange(alreadySelected ? [] : [option.id]);
      return;
    }

    // selecting any real option clears NOTA if it was selected
    const notaOption = options.find(isNota);
    let next = selectedIds.filter((id) => id !== notaOption?.id);

    if (alreadySelected) {
      next = next.filter((id) => id !== option.id);
    } else {
      if (maxSelections && next.length >= maxSelections) {
        return; // silently ignore -- UI already shows the cap via helper text below
      }
      next = [...next, option.id];
    }

    onChange(next);
  };

  return (
    <>
      {maxSelections && (
        <HelperText>
          Choose up to {maxSelections} ({selectedIds.length}/{maxSelections} selected)
        </HelperText>
      )}
      <Options>
        {options.map((option) => {
          const selected = selectedIds.includes(option.id);
          return (
            <Option
              key={option.id}
              type="button"
              $selected={selected}
              onClick={() => handleToggle(option)}
              aria-pressed={selected}
            >
              {option.label}
              <Checkbox $selected={selected} />
            </Option>
          );
        })}
      </Options>
    </>
  );
}