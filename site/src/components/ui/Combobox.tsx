import { Combobox as KCombobox } from "@kobalte/core/combobox";
import { CheckmarkIcon, ChevronDownIcon } from "./icons";

interface ComboboxProps {
  options: string[];
  value: string;
  label?: string;
  placeholder?: string;
  allowsCustomValue?: boolean;
  onChange: (value: string) => void;
  onInputChange: (value: string) => void;
  class?: string;
}

export default function Combobox(props: ComboboxProps) {
  return (
    <KCombobox
      options={props.options}
      value={props.value}
      onChange={props.onChange}
      onInputChange={props.onInputChange}
      allowsCustomValue={props.allowsCustomValue}
      placeholder={props.placeholder}
      itemComponent={(ip) => (
        <KCombobox.Item item={ip.item} class="kb-combobox__item">
          <KCombobox.ItemLabel class="kb-combobox__item-label">
            {ip.item.rawValue}
          </KCombobox.ItemLabel>
          <KCombobox.ItemIndicator class="kb-combobox__item-indicator">
            <CheckmarkIcon />
          </KCombobox.ItemIndicator>
        </KCombobox.Item>
      )}
    >
      <div class={`kb-combobox ${props.class ?? ""}`}>
        {props.label && (
          <KCombobox.Label class="kb-combobox__label">
            {props.label}
          </KCombobox.Label>
        )}
        <KCombobox.Control class="kb-combobox__control">
          <KCombobox.Input class="kb-combobox__input" />
          <KCombobox.Trigger class="kb-combobox__trigger">
            <KCombobox.Icon class="kb-combobox__icon">
              <ChevronDownIcon />
            </KCombobox.Icon>
          </KCombobox.Trigger>
        </KCombobox.Control>
      </div>
      <KCombobox.Portal>
        <KCombobox.Content class="kb-combobox__content">
          <KCombobox.Listbox class="kb-combobox__listbox" />
        </KCombobox.Content>
      </KCombobox.Portal>
    </KCombobox>
  );
}
