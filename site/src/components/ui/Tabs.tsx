import { Tabs as KTabs } from "@kobalte/core/tabs";
import { splitProps, type ComponentProps, type JSXElement } from "solid-js";

export interface Tab {
  value: string;
  label: string;
  disabled?: boolean;
}

interface TabsProps extends ComponentProps<typeof KTabs> {
  tabs: Tab[];
  children: (activeTab: string) => JSXElement;
}

export default function Tabs(props: TabsProps) {
  const [local, rest] = splitProps(props, ["tabs", "children", "class"]);

  return (
    <KTabs {...rest} class={`kb-tabs ${local.class ?? ""}`}>
      <KTabs.List class="kb-tabs__list">
        {local.tabs.map((tab) => (
          <KTabs.Trigger
            class="kb-tabs__trigger"
            value={tab.value}
            disabled={tab.disabled}
          >
            {tab.label}
          </KTabs.Trigger>
        ))}
        <KTabs.Indicator class="kb-tabs__indicator" />
      </KTabs.List>
      {local.tabs.map((tab) => (
        <KTabs.Content class="kb-tabs__content" value={tab.value}>
          {local.children(tab.value)}
        </KTabs.Content>
      ))}
    </KTabs>
  );
}
