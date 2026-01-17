# 🎯 Optimize Prompt Skill

---

name: optimize-prompt
description: Improve AI prompts for better accuracy, relevance, and effectiveness

---

## Overview

This skill enables AI assistants to analyze, refine, and optimize prompts to achieve better results from AI systems. Effective prompt engineering is crucial for getting accurate, relevant, and useful outputs from large language models.

## Core Principles

### 1. Clarity and Specificity

- Be explicit about what you want
- Remove ambiguity and vagueness
- Provide concrete examples when possible
- Define technical terms or domain-specific language

### 2. Context and Constraints

- Provide relevant background information
- Specify format, length, and style requirements
- Define boundaries and limitations
- Include success criteria

### 3. Iterative Refinement

- Start with a baseline prompt
- Test and measure results
- Refine based on outputs
- Document what works and what doesn't

## Prompt Structure

### Essential Components

```
[Role] - Who the AI should act as
[Context] - Background information needed
[Task] - What you want accomplished
[Format] - How the output should be structured
[Constraints] - Limitations or requirements
[Examples] - Sample inputs/outputs (optional)
```

### Basic Template

```
You are a [role] with expertise in [domain].

Context: [Provide relevant background information]

Task: [Clearly state what you want]

Requirements:
- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Output format: [Specify structure]

Example: [Optional example]
```

## Prompt Optimization Techniques

### 1. Be Specific and Direct

**Poor:**

```
Write some code for a website.
```

**Better:**

```
Write a responsive navigation bar component in React with TypeScript.
Include mobile menu toggle, dropdown support, and accessibility features.
Use Tailwind CSS for styling.
```

### 2. Provide Context

**Poor:**

```
Fix this bug.
```

**Better:**

```
The user registration form is not validating email addresses correctly.
It accepts invalid formats like "user@" or "user@domain".
Fix the email validation regex to match RFC 5322 standards.
The validation is in src/utils/validators.ts, line 45.
```

### 3. Specify Format

**Poor:**

```
Explain how React hooks work.
```

**Better:**

```
Explain how React hooks work in the following format:

1. Brief overview (2-3 sentences)
2. Three most common hooks with code examples
3. Best practices (bullet points)
4. Common mistakes to avoid

Target audience: Developers with basic JavaScript knowledge but new to React.
```

### 4. Use Examples

**Poor:**

```
Convert this data to JSON.
```

**Better:**

```
Convert the following CSV data to JSON format:

Input:
name,age,city
John,30,NYC
Jane,25,LA

Expected output:
[
  {"name": "John", "age": 30, "city": "NYC"},
  {"name": "Jane", "age": 25, "city": "LA"}
]

Process the actual data in the attached file.
```

### 5. Break Down Complex Tasks

**Poor:**

```
Build a complete e-commerce application.
```

**Better:**

```
Step 1: Create a product catalog page with the following features:
- Grid layout displaying product cards
- Each card shows image, name, price, and rating
- Filter by category and price range
- Sort by price, name, or rating
- Pagination (12 items per page)

Use React, TypeScript, and a REST API endpoint.
Focus only on the catalog page for now.
```

### 6. Set Constraints

**Poor:**

```
Write a function to sort an array.
```

**Better:**

```
Write a function to sort an array of numbers in JavaScript.

Constraints:
- Do not use built-in Array.sort()
- Implement quicksort algorithm
- Handle edge cases (empty array, single element, duplicates)
- Time complexity should be O(n log n) average case
- Include JSDoc comments
- Add unit tests using Jest
```

## Prompt Patterns

### Chain-of-Thought Prompting

Encourage step-by-step reasoning:

```
Solve this problem step by step:

Problem: [State the problem]

Think through this by:
1. Identifying the key information
2. Breaking down the approach
3. Working through the solution
4. Verifying the answer

Show your reasoning at each step.
```

### Role-Based Prompting

Define a specific expert role:

```
You are a senior database architect with 15 years of experience
in designing high-performance, scalable database systems.

Review the following database schema for an e-commerce platform
and provide recommendations for:
- Indexing strategy
- Query optimization
- Scalability improvements
- Data integrity constraints
```

### Few-Shot Prompting

Provide multiple examples:

```
Convert function names from camelCase to snake_case.

Examples:
getUserData -> get_user_data
calculateTotal -> calculate_total
isValid -> is_valid

Now convert:
fetchUserProfile
validateEmailAddress
processPaymentMethod
```

### Template-Based Prompting

Create reusable structures:

```
Analyze the following code for:

1. **Functionality**: Does it work correctly?
2. **Performance**: Are there efficiency concerns?
3. **Readability**: Is it easy to understand?
4. **Best Practices**: Does it follow conventions?
5. **Security**: Are there vulnerabilities?

Code:
[Insert code here]

Provide specific recommendations for each category.
```

### Persona Prompting

Define audience and style:

```
Explain [technical concept] as if you're:
- A teacher explaining to a 10-year-old
- Use simple analogies
- Avoid technical jargon
- Keep it under 100 words
- Make it engaging and fun
```

## Common Prompt Problems and Solutions

### Problem 1: Vague or Ambiguous Requests

**Issue:**

```
Make this better.
```

**Solution:**

```
Improve this function's performance by:
- Reducing time complexity
- Minimizing memory usage
- Removing redundant operations

Current performance: O(n²), 500ms for 1000 items
Target: O(n log n), under 100ms for 1000 items
```

### Problem 2: Missing Context

**Issue:**

```
Debug this error: "Cannot read property 'map' of undefined"
```

**Solution:**

```
I'm getting this error in a React component:
"Cannot read property 'map' of undefined"

Context:
- Error occurs when rendering a list of users
- Data is fetched from API endpoint /api/users
- Component: UserList.tsx, line 42
- The error happens on initial render before data loads

Code snippet:
{users.map(user => <UserCard key={user.id} user={user} />)}

How should I handle the loading state?
```

### Problem 3: Too Broad

**Issue:**

```
Teach me Python.
```

**Solution:**

```
I'm a JavaScript developer learning Python for backend development.

Please explain:
1. Key syntax differences from JavaScript
2. How to set up a basic REST API with Flask
3. Best practices for project structure
4. Recommended tools and libraries

Focus on practical examples I can apply immediately.
```

### Problem 4: Insufficient Detail

**Issue:**

```
Write tests for this function.
```

**Solution:**

````
Write unit tests for the calculateDiscount function below using Jest.

Function:
```javascript
function calculateDiscount(price, discountPercent, membershipLevel) {
  // Returns final price after discount
}
````

Test cases to cover:

- Valid inputs with different discount percentages
- Edge cases: 0% discount, 100% discount
- Invalid inputs: negative prices, invalid membership levels
- Boundary conditions: very large numbers
- Type checking: non-numeric inputs

Include describe blocks and clear test descriptions.

```

### Problem 5: Missing Format Specification

**Issue:**
```

List the benefits of using TypeScript.

```

**Solution:**
```

List the benefits of using TypeScript in the following format:

For each benefit:

- **Title**: Brief name (3-5 words)
- **Explanation**: 1-2 sentence description
- **Example**: Concrete code example showing the benefit
- **Impact**: How it helps developers

Provide 5 benefits total.
Format as markdown with code blocks for examples.

```

## Domain-Specific Optimization

### Code Generation Prompts

```

Language: [Programming language]
Task: [What to build]
Requirements:

- Dependencies: [Libraries/frameworks]
- Code style: [Conventions to follow]
- Error handling: [How to handle errors]
- Comments: [Documentation style]
- Tests: [Testing requirements]

Input: [Sample input data]
Expected output: [Sample output]

Additional constraints: [Any limitations]

```

### Code Review Prompts

```

Review this [language] code for [specific purpose].

Focus areas:

1. Correctness: Logic errors, edge cases
2. Performance: Time/space complexity, bottlenecks
3. Security: Vulnerabilities, input validation
4. Maintainability: Readability, documentation
5. Best practices: Language-specific conventions

Provide:

- Severity rating (Critical/High/Medium/Low)
- Specific line numbers
- Recommended fixes with code examples
- Explanation of why each issue matters

```

### Debugging Prompts

```

Debug the following issue:

Symptom: [What's happening]
Expected: [What should happen]
Environment: [OS, language version, dependencies]
Steps to reproduce:

1. [Step 1]
2. [Step 2]
3. [Step 3]

Code: [Relevant code snippet]
Error message: [Full error text]
Stack trace: [If available]

What I've tried: [Previous debugging attempts]

Please provide:

- Root cause analysis
- Step-by-step fix
- Prevention strategies

```

### Documentation Prompts

```

Write documentation for [code/feature] following this structure:

1. **Overview**: What it does (1 paragraph)
2. **Installation**: Setup steps
3. **Quick Start**: Minimal example to get started
4. **API Reference**:
   - Functions/methods with signatures
   - Parameters with types and descriptions
   - Return values
   - Usage examples
5. **Advanced Usage**: Complex scenarios
6. **Common Issues**: Troubleshooting guide

Audience: [Target users]
Tone: [Professional/friendly/technical]
Format: [Markdown/JSDoc/etc.]

```

### Refactoring Prompts

```

Refactor this code to improve [specific aspect]:

Current code:
[Code snippet]

Goals:

- [Goal 1: e.g., reduce complexity]
- [Goal 2: e.g., improve testability]
- [Goal 3: e.g., follow SOLID principles]

Constraints:

- Maintain backward compatibility
- Keep the same public API
- Don't add external dependencies

Provide:

- Refactored code with comments explaining changes
- Before/after comparison of key metrics
- Migration guide if API changes are necessary

```

## Testing and Measuring Prompts

### Evaluation Criteria

Assess prompt effectiveness by:

1. **Accuracy**: Does it produce correct results?
2. **Relevance**: Is the output on-topic and useful?
3. **Completeness**: Does it address all requirements?
4. **Consistency**: Does it work reliably across runs?
5. **Efficiency**: Does it get results without excessive iteration?

### A/B Testing Prompts

```

Version A: [First prompt variant]
Version B: [Second prompt variant]

Test with: [Sample inputs]
Measure: [Success criteria]
Compare: [Specific aspects]

```

### Iterative Refinement Process

1. **Baseline**: Create initial prompt
2. **Test**: Run with sample inputs
3. **Analyze**: Identify gaps or issues
4. **Refine**: Adjust specific elements
5. **Retest**: Verify improvements
6. **Document**: Record what worked

## Best Practices

### Do:

- ✅ Start with clear objectives and success criteria
- ✅ Provide relevant context and background
- ✅ Use specific, concrete language
- ✅ Include examples when helpful
- ✅ Specify desired format and structure
- ✅ Break complex tasks into steps
- ✅ Define constraints and boundaries
- ✅ Test prompts with edge cases
- ✅ Iterate based on results
- ✅ Document successful patterns

### Don't:

- ❌ Use vague or ambiguous language
- ❌ Assume the AI has context it doesn't have
- ❌ Mix multiple unrelated tasks in one prompt
- ❌ Overload with unnecessary information
- ❌ Skip testing with diverse inputs
- ❌ Use inconsistent terminology
- ❌ Forget to specify output format
- ❌ Make assumptions about AI capabilities
- ❌ Use jargon without explanation

## Advanced Techniques

### Multi-Step Prompting

Break complex tasks into a sequence:

```

Step 1: Analyze the requirements and create a plan
[Wait for response]

Step 2: Based on your plan, implement the core functionality
[Wait for response]

Step 3: Add error handling and edge case management
[Wait for response]

Step 4: Write tests and documentation

```

### Conditional Prompting

Guide based on scenarios:

```

If [condition A]:

- Do [action 1]
- Follow [approach 1]

If [condition B]:

- Do [action 2]
- Follow [approach 2]

Else:

- Do [default action]

```

### Meta-Prompting

Ask AI to improve the prompt:

```

Here's a prompt I'm using:
"[Your current prompt]"

The results aren't meeting my needs because:

- [Issue 1]
- [Issue 2]

How can I improve this prompt to get better results?
Provide a refined version with explanation of changes.

```

### Prompt Chaining

Link outputs to inputs:

```

Task 1: Extract key information from this document
Output: [Structured data]

Task 2: Using the extracted data, generate a summary
Input: [Use output from Task 1]

Task 3: Based on the summary, create recommendations
Input: [Use output from Task 2]

```

## Common Use Cases

### Code Explanation

```

Explain how this code works:

[Code snippet]

Include:

1. High-level overview
2. Line-by-line breakdown of complex parts
3. Key concepts or patterns used
4. Potential improvements
5. Common pitfalls to avoid

Assume the reader knows [baseline knowledge].

```

### Architecture Design

```

Design a system architecture for [description].

Requirements:

- Scale: [Number of users/requests]
- Latency: [Performance requirements]
- Availability: [Uptime requirements]
- Data: [Storage and consistency needs]

Provide:

1. Component diagram
2. Technology stack recommendations with rationale
3. Data flow description
4. Scaling strategy
5. Failure modes and mitigation
6. Cost considerations

```

### Code Conversion

```

Convert this [source language] code to [target language]:

Source code:
[Code]

Requirements:

- Use idiomatic [target language] patterns
- Maintain equivalent functionality
- Add appropriate error handling
- Include type annotations if applicable
- Follow [style guide]

Explain significant differences in approach.

```

### Performance Optimization

```

Optimize this code for [performance metric]:

Current code:
[Code snippet]

Metrics:

- Current: [Measurement]
- Target: [Goal]
- Constraints: [Limitations]

Provide:

1. Bottleneck analysis
2. Optimized code with explanations
3. Before/after performance comparison
4. Trade-offs made
5. Testing approach to verify improvements

```

## Prompt Templates Library

### Bug Report Analysis

```

Analyze this bug report and provide a structured investigation plan:

Bug Report:
[Report details]

Provide:

1. **Severity Assessment**: Critical/High/Medium/Low with justification
2. **Reproduction Steps**: Verified steps to reproduce
3. **Root Cause Hypothesis**: Most likely causes
4. **Investigation Plan**: Steps to confirm root cause
5. **Estimated Complexity**: Time/effort to fix
6. **Workaround**: Temporary solution if available

```

### API Design

```

Design a REST API for [purpose].

Resources:

- [Resource 1]
- [Resource 2]
- [Resource 3]

For each endpoint provide:

- HTTP method and path
- Request body schema
- Response format (success and error)
- Status codes
- Authentication requirements
- Rate limiting considerations

Follow RESTful best practices and industry standards.

```

### Test Case Generation

```

Generate comprehensive test cases for:

[Function/feature description]

Include:

1. **Happy Path**: Normal, expected scenarios
2. **Edge Cases**: Boundary conditions
3. **Error Cases**: Invalid inputs, error conditions
4. **Security**: Input validation, injection attempts
5. **Performance**: Large datasets, stress conditions

Format as:

- Test name
- Input
- Expected output
- Assertions to verify

```

## Quick Reference

### Prompt Optimization Checklist

- [ ] Clear objective defined
- [ ] Sufficient context provided
- [ ] Task broken into manageable parts
- [ ] Format/structure specified
- [ ] Examples included (if needed)
- [ ] Constraints and requirements listed
- [ ] Success criteria defined
- [ ] Ambiguity eliminated
- [ ] Tested with sample inputs
- [ ] Refined based on results

### Key Questions to Ask

Before writing a prompt:
1. What exactly do I want to achieve?
2. What context does the AI need?
3. What format should the output be?
4. What constraints or requirements exist?
5. How will I measure success?
6. What examples would clarify the request?

### Red Flags

Watch out for these in your prompts:
- 🚩 "Just..." or "Simply..." (often more complex than you think)
- 🚩 "Something like..." (be specific)
- 🚩 Multiple unrelated tasks
- 🚩 Assuming unstated context
- 🚩 No success criteria
- 🚩 Vague qualifiers ("better", "good", "nice")

## Summary

Effective prompt engineering is both an art and a science. The key is to be clear, specific, and provide appropriate context. Good prompts save time, reduce iteration, and produce better results.

**Remember**: The quality of the output is directly related to the quality of the input. Invest time in crafting good prompts, and you'll get significantly better results from AI systems.

---

**Pro Tip**: Keep a collection of your best-performing prompts and iterate on them. What works for one task can often be adapted for similar tasks.
```
