import { Tabs } from "./ui";
import type { Tab } from "./ui";

interface CodeExample {
  kicker: string;
  title: string;
  code: string;
}

export default function CodeTabs(props: { examples: CodeExample[] }) {
  const tabs: Tab[] = props.examples.map((ex) => ({
    value: ex.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    label: ex.title,
  }));

  return (
    <Tabs tabs={tabs}>
      {(activeTab) => {
        const ex = props.examples.find(
          (e) => e.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") === activeTab,
        );
        if (!ex) return null;
        return (
          <div class="panel code-panel">
            <div class="panel-kicker">{ex.kicker}</div>
            <pre><code>{ex.code}</code></pre>
          </div>
        );
      }}
    </Tabs>
  );
}
