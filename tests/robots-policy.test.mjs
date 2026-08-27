import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import test from "node:test";

const robots = await readFile(new URL("../robots.txt", import.meta.url), "utf8")
    .catch((error) => error.code === "ENOENT" ? "" : Promise.reject(error));

const groups = [];
let group = null;

for (const rawLine of robots.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const separator = line.indexOf(":");
    if (separator === -1) continue;

    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
        group = {agent: value.toLowerCase(), rules: []};
        groups.push(group);
    } else if (group && (field === "allow" || field === "disallow")) {
        group.rules.push({field, path: value});
    }
}

const isAllowed = (userAgent, path = "/") => {
    const normalizedAgent = userAgent.toLowerCase();
    const matches = groups.filter(({agent}) =>
        agent === "*" || normalizedAgent.includes(agent)
    );
    const specificity = Math.max(...matches.map(({agent}) =>
        agent === "*" ? 0 : agent.length
    ));
    const rules = matches
        .filter(({agent}) => (agent === "*" ? 0 : agent.length) === specificity)
        .flatMap(({rules: matchingRules}) => matchingRules)
        .filter((rule) => rule.path && path.startsWith(rule.path))
        .sort((left, right) =>
            right.path.length - left.path.length ||
            Number(right.field === "allow") - Number(left.field === "allow")
        );

    return rules.length === 0 || rules[0].field === "allow";
};

test("allows AI search and user-directed retrieval crawlers", () => {
    for (const agent of [
        "OAI-SearchBot",
        "ChatGPT-User",
        "Claude-SearchBot",
        "Claude-User",
    ]) {
        assert.equal(isAllowed(agent), true, `${agent} cannot crawl the site`);
    }
});

test("keeps model-training crawlers out", () => {
    for (const agent of ["GPTBot", "ClaudeBot", "Google-Extended"]) {
        assert.equal(isAllowed(agent), false, `${agent} can crawl the site`);
    }
});

test("declares discovery use and the canonical sitemap", () => {
    assert.match(
        robots,
        /^Content-Signal:\s*search=yes,ai-input=yes,ai-train=no,use=reference$/m,
    );
    assert.match(robots, /^Sitemap:\s*https:\/\/www\.cruxcut\.com\/sitemap\.xml$/m);
});
