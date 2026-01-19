# Reference Material

## Core Principles

1. **Clarity**: Be explicit. Ambiguity leads to hallucinations.
2. **Context**: Provide background, constraints, and goal.
3. **Format**: Define *how* you want the answer (JSON, list, code-only).
4. **Iteration**: Prompting is a loop. Test -> Refine -> Repeat.

## Prompt Components

| Component | Purpose | Example |
|-----------|---------|---------|
| **Role** | Sets expectations/expertise | "You are a Senior SRE..." |
| **Context** | Background info | "We use AWS and Terraform..." |
| **Task** | The actual instruction | "Write a script to rotate keys..." |
| **Constraints** | Boundaries | "Do not use external libs..." |
| **Output** | Structure | "Return valid JSON only..." |

## Best Practices

- **Do**: Use delimiters (```) to separate instructions from data.
- **Do**: Ask for "step-by-step" reasoning (CoT) for complex logic.
- **Do**: Provide positive examples (few-shot).
- **Don't**: Use negative constraints alone (e.g., "Don't do X"). Say "Do Y instead".
- **Don't**: Overload one prompt. Split complex tasks into a chain.

## Advanced Techniques

- **Meta-Prompting**: Asking the AI to improve your prompt.
- **Chain-of-Thought**: Forcing the model to "show its work" improves accuracy.
- **Self-Consistency**: Asking the model to generate multiple answers and pick the best (or most frequent).
