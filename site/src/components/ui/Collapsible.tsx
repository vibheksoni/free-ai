import { Collapsible as KCollapsible } from "@kobalte/core/collapsible";
import { splitProps, type ComponentProps, type JSXElement } from "solid-js";
import { ChevronDownIcon } from "./icons";

interface CollapsibleProps extends ComponentProps<typeof KCollapsible> {
  title: string;
  children: JSXElement;
}

export default function Collapsible(props: CollapsibleProps) {
  const [local, rest] = splitProps(props, ["title", "children", "class"]);

  return (
    <KCollapsible {...rest} class={`kb-collapsible ${local.class ?? ""}`}>
      <KCollapsible.Trigger class="kb-collapsible__trigger">
        <span class="kb-collapsible__title">{local.title}</span>
        <ChevronDownIcon class="kb-collapsible__chevron" />
      </KCollapsible.Trigger>
      <KCollapsible.Content class="kb-collapsible__content">
        <div class="kb-collapsible__body">{local.children}</div>
      </KCollapsible.Content>
    </KCollapsible>
  );
}
