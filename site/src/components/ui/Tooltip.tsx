import { Tooltip as KTooltip } from "@kobalte/core/tooltip";
import { splitProps, type ComponentProps, type JSXElement } from "solid-js";

interface TooltipProps extends ComponentProps<typeof KTooltip> {
  content: string;
  children: JSXElement;
}

export default function Tooltip(props: TooltipProps) {
  const [local, rest] = splitProps(props, ["content", "children", "class"]);

  return (
    <KTooltip {...rest} openDelay={400} closeDelay={200}>
      <KTooltip.Trigger
        as="span"
        class={`kb-tooltip__trigger ${local.class ?? ""}`}
      >
        {local.children}
      </KTooltip.Trigger>
      <KTooltip.Portal>
        <KTooltip.Content class="kb-tooltip__content">
          <KTooltip.Arrow />
          <p>{local.content}</p>
        </KTooltip.Content>
      </KTooltip.Portal>
    </KTooltip>
  );
}
