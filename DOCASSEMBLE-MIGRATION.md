# Migrating from Docassemble to Document Assembly

This guide is for people (and LLMs) converting a [Docassemble](https://docassemble.org) interview into a survey package for this application. It covers interview structure, field type mappings, conditional logic, and DOCX template conversion.

---

## Contents

1. [Conceptual differences](#1-conceptual-differences)
2. [Interview structure mapping](#2-interview-structure-mapping)
3. [Field type mapping table](#3-field-type-mapping-table)
4. [Conditional logic](#4-conditional-logic)
5. [DOCX template conversion](#5-docx-template-conversion)
6. [What Docassemble features have no equivalent](#6-what-docassemble-features-have-no-equivalent)
7. [Step-by-step worked example](#7-step-by-step-worked-example)
8. [LLM conversion prompt](#8-llm-conversion-prompt)

---

## 1. Conceptual differences

| Concept | Docassemble | This application |
|---|---|---|
| **Interview logic** | Python code drives question order; questions are shown when their variable is needed | Linear page-by-page flow; conditional visibility hides/shows questions on a page |
| **Questionnaire format** | YAML file(s) on a server | JSON file, loaded from a `.zip` package |
| **Template format** | DOCX or PDF with Mako/Jinja2 expressions (`${ variable }`) | DOCX with simple `{placeholder}` tags |
| **Document output** | Server renders the document | Client-side rendering in the browser; no server required |
| **Multi-screen layout** | Each `question` block is one screen | Each `page` object in the survey JSON is one screen |
| **Multiple fields per screen** | `fields:` list in a `question` block | Multiple `elements` in a `page` |
| **Conditional questions** | `show if:`/`hide if:` on individual fields; `mandatory` logic | `visibleIf` expression on any element or page |
| **Object/list variables** | `DAObject`, `DAList`, `DADict`, index variables `[i]` | Not supported directly; checkbox arrays only |

---

## 2. Interview structure mapping

A Docassemble interview is a **YAML file** containing multiple `---`-separated blocks. Each `question` block typically becomes one **page** in the survey. Fields inside a `fields:` specifier on one screen become **elements** on that page.

### Docassemble structure → Survey JSON structure

```
Docassemble interview (.yml)         Survey definition (.json)
─────────────────────────────────    ──────────────────────────────────
interview metadata block         →   "title", "description" at root
question block (one screen)      →   one object in "pages" array
  question: (heading text)       →     page "title"
  subquestion: (body text)       →     page "description" OR html element
  fields: (list of inputs)       →     "elements" array on that page
    - Label: variable_name       →       { "type": "...", "name": "...", "title": "..." }
  yesno: variable_name           →     single boolean element
  choices: (radio list)          →     single radiogroup element
  dropdown: (dropdown list)      →     single dropdown element
section/nav labels               →   page "title" values
```

### Page naming

- In Docassemble, `question` blocks do not have stable names by default (unless given an `id:`).
- In this application every page needs a `name` (camelCase, no spaces), e.g. `basicInfo`, `compensation`.
- Name pages by their topic, not their order: `personalDetails`, not `page1`.

---

## 3. Field type mapping table

### Simple field types (`fields:` specifier)

| Docassemble `datatype` / `input type` | Survey.js `type` | Additional property | Notes |
|---|---|---|---|
| `text` (default) | `"text"` | — | Single-line text |
| `input type: area` | `"comment"` | — | Multi-line text area |
| `date` | `"text"` | `"inputType": "date"` | Stored as `YYYY-MM-DD` string |
| `time` | `"text"` | `"inputType": "time"` | |
| `datetime` | `"text"` | `"inputType": "datetime-local"` | |
| `number` | `"text"` | `"inputType": "number"` | |
| `integer` | `"text"` | `"inputType": "number"` | No separate integer type |
| `currency` | `"text"` | `"inputType": "number"` | No currency formatting; add note in `description` |
| `email` | `"text"` | `"inputType": "email"` | |
| `password` | `"text"` | — | No password masking; omit sensitive fields or use plain text |
| `yesno` (in fields) | `"boolean"` | — | Stored as `true`/`false` |
| `noyes` (in fields) | `"boolean"` | — | ⚠️ Logic is **inverted** — "Yes" = `false`. Rewrite as `yesno` and flip downstream references |
| `yesnomaybe` | `"radiogroup"` | `"choices": ["Yes", "No", "Unknown"]` | No native three-state boolean; use radiogroup |
| `checkboxes` | `"checkbox"` | `"choices": [...]` | Stores an array of selected string values |
| `radio` input type | `"radiogroup"` | `"choices": [...]` | |
| `dropdown` input type | `"dropdown"` | `"choices": [...]` | |
| `combobox` | `"dropdown"` | `"choices": [...]` | ⚠️ Free-text entry not supported; use dropdown |

### Top-level question block types

| Docassemble block type | Survey.js equivalent | Notes |
|---|---|---|
| `yesno: var` | `{ "type": "boolean", "name": "var" }` | One-question page or element |
| `noyes: var` | `{ "type": "boolean", "name": "var" }` | ⚠️ Invert all `visibleIf` references |
| `field: var` + `choices:` | `{ "type": "radiogroup", ... }` | |
| `field: var` + `buttons:` | `{ "type": "radiogroup", ... }` | Buttons render the same as radio in this app |
| `field: var` + `dropdown:` | `{ "type": "dropdown", ... }` | |
| `continue button field: var` | Page boundary | Set as last element on a page or omit; page navigation handles this |
| `subquestion:` text only | `{ "type": "html", "name": "intro_text", "html": "<p>...</p>" }` | Use for instructional content |
| `section:` | Page `"title"` | Sections become page headings |

### Field modifiers

| Docassemble modifier | Survey.js property | Notes |
|---|---|---|
| `required: True` / `required: False` | `"isRequired": true` / `"isRequired": false` | Defaults to `false` if omitted |
| `default: value` | `"defaultValue": value` | Same semantics |
| `hint: text` | `"placeholder": "text"` | The greyed-out text inside an input box |
| `help: text` | `"description": "text"` | Shown below the question label |
| `label: text` | `"title": "text"` | When label is specified separately from the variable name |
| `show if:` | `"visibleIf":` | See [Conditional logic](#4-conditional-logic) |
| `hide if:` | `"visibleIf":` (negated) | See [Conditional logic](#4-conditional-logic) |

---

## 4. Conditional logic

### Expression translation

Docassemble uses Python boolean expressions in `show if:` and `hide if:`. Survey.js uses its own simple expression language in `visibleIf`.

**Key syntax differences:**

| Docassemble (Python) | Survey.js `visibleIf` |
|---|---|
| `variable` (truthy check) | `{variable}` |
| `not variable` | `!{variable}` |
| `variable == 'value'` | `{variable} = 'value'` *(single `=`)*  |
| `variable != 'value'` | `{variable} <> 'value'` |
| `variable == True` | `{variable} = true` |
| `variable == False` | `{variable} = false` |

**`show if:` → `visibleIf`** (direct translation):
```yaml
# Docassemble
- Annual Salary: annual_salary
  show if: is_salary_based
```
```json
{
  "type": "text",
  "name": "annual_salary",
  "title": "Annual Salary",
  "inputType": "number",
  "visibleIf": "{is_salary_based} = true"
}
```

**`hide if:` → negated `visibleIf`**:
```yaml
# Docassemble
- Office Address: office_address
  hide if: is_remote
```
```json
{
  "type": "text",
  "name": "office_address",
  "title": "Office Address",
  "visibleIf": "{is_remote} = false"
}
```

**Multiple conditions** — Survey.js supports `and`/`or`:
```yaml
# Docassemble
- Bonus Amount: bonus_amount
  show if:
    variable: is_salary_based
    is: True
```
```json
{
  "visibleIf": "{is_salary_based} = true and {employment_type} = 'Full-time'"
}
```

### Page-level visibility

If an entire Docassemble `question` block is only reached under certain logic, apply `visibleIf` to the whole page:

```json
{
  "name": "compensationDetails",
  "title": "Compensation",
  "visibleIf": "{employment_type} <> 'Volunteer'",
  "elements": [...]
}
```

### Docassemble `mandatory` logic

Docassemble uses `mandatory: True` blocks and Python `code:` blocks to control interview flow. This application does not have a code execution engine — flow is controlled purely by page order and `visibleIf` expressions.

**Strategy for converting mandatory/code logic:**
1. Identify which variables are set by `code:` blocks.
2. If the code sets a variable based on another variable's value (a simple derivation), represent this as conditional visibility of the questions that depend on it.
3. If the code performs complex computation, you will need to simplify: either ask the computed question directly, or pre-compute answers outside the survey.

---

## 5. DOCX template conversion

Docassemble and this application both use DOCX files as templates, but with different placeholder syntax.

### Placeholder syntax

| Docassemble | This application | Notes |
|---|---|---|
| `${ variable_name }` (Mako) | `{{variable_name}}` | Simple value substitution |
| `{{ variable_name }}` (Jinja2) | `{{variable_name}}` | Already double-braces — just remove spaces |
| `{% if condition %}...{% endif %}` | `{{#condition}}...{{/condition}}` | Conditional block (docxtemplater Mustache syntax) |
| `{% if not condition %}...{% endif %}` | `{{^condition}}...{{/condition}}` | Inverted conditional |
| `{% for item in list %}...{% endfor %}` | `{{#list}}...{{/list}}` | Loop block — iterates over an array field |
| `${ user.name }` (object attribute) | `{{user_name}}` | Flatten object attributes to simple field names |
| `${ format_date(date_var) }` | `{{date_var}}` | Date formatting via transforms; see field mappings |

### Field mapping note

After converting templates, create a field mapping entry for each placeholder in the DOCX. The mapping connects the survey `name` (field identifier) to the template `{{placeholder}}`. If names match exactly, the app will auto-suggest the mapping at confidence 1.0.

**Recommendation:** when naming survey fields, use the same string as the DOCX placeholder to get automatic perfect-match mapping with no manual work.

### Template conversion procedure

1. Open the Docassemble DOCX template in Word.
2. Find all Mako/Jinja2 expressions (typically `${ ... }` or `{{ ... }}`).
3. Replace each `${ field_name }` with `{{field_name}}` matching the corresponding survey field `name`.
4. Replace conditional blocks: `{% if var %}` → `{{#var}}`, `{% endif %}` → `{{/var}}`.
5. Replace inverted conditionals: `{% if not var %}` → `{{^var}}`, `{% endif %}` → `{{/var}}`.
6. Replace loops: `{% for item in list %}` → `{{#list}}`, `{% endfor %}` → `{{/list}}`.
7. Save as `.docx` and upload as the package template.

---

## 6. What Docassemble features have no equivalent

The following Docassemble features are **not supported** and require manual workarounds or simplification:

| Docassemble feature | Situation | Recommended workaround |
|---|---|---|
| `code:` blocks | Computed/derived variables | Ask directly, or pre-compute outside the survey |
| `DAObject` / `DAList` / `DADict` | Object-oriented data models | Flatten to individual `snake_case` fields |
| Index variables (`[i]`, `[j]`) | Collecting a variable-length list of similar items | Add a fixed set of fields (e.g. `item_1`, `item_2`, `item_3`) or use a single `comment` field |
| `review:` blocks | Allowing users to revisit earlier answers | Not available; users can use the Back button |
| `signature:` | Collecting a drawn signature | Not supported |
| `file:` / `files:` | File upload questions | Not supported |
| `table:` blocks | Displaying tabular data | Use an `html` element with a `<table>` |
| `attachment:` (server-side generation) | Server renders the document | All rendering is client-side; equivalent is built-in |
| Role-based interviews | Different question sets for different users | Create separate packages for each role |
| `interview help:` / global help | Interview-wide help text | Add `html` elements or page `description` fields |
| Dynamic choices from `code:` | `choices: code: [...]` | Provide a fixed `choices` list; if truly dynamic, ask a text field instead |
| `yesnomaybe` / three-state booleans | True / False / None | Use `radiogroup` with three explicit choices |

---

## 7. Step-by-step worked example

### Source: Docassemble interview (YAML)

```yaml
---
question: Basic Information
fields:
  - Full Name: client_name
  - Date of Birth: client_dob
    datatype: date
  - Are you a UK resident?: is_uk_resident
    datatype: yesno
---
question: Employment Status
fields:
  - Employment Status: employment_status
    input type: radio
    choices:
      - Employed
      - Self-employed
      - Unemployed
      - Retired
  - Employer Name: employer_name
    show if: employment_status == 'Employed'
  - Annual Income: annual_income
    datatype: currency
    show if:
      variable: employment_status
      is: Employed
---
question: Additional Notes
fields:
  - Notes: additional_notes
    input type: area
    required: False
---
mandatory: True
question: Thank you
subquestion: |
  Your information has been submitted.
```

### Result: Survey JSON

```json
{
  "title": "Client Information",
  "description": "Please provide your personal and employment details.",
  "pages": [
    {
      "name": "basicInfo",
      "title": "Basic Information",
      "elements": [
        {
          "type": "text",
          "name": "client_name",
          "title": "Full Name",
          "isRequired": true
        },
        {
          "type": "text",
          "name": "client_dob",
          "title": "Date of Birth",
          "inputType": "date",
          "isRequired": true
        },
        {
          "type": "boolean",
          "name": "is_uk_resident",
          "title": "Are you a UK resident?",
          "isRequired": true
        }
      ]
    },
    {
      "name": "employmentStatus",
      "title": "Employment Status",
      "elements": [
        {
          "type": "radiogroup",
          "name": "employment_status",
          "title": "Employment Status",
          "isRequired": true,
          "choices": ["Employed", "Self-employed", "Unemployed", "Retired"]
        },
        {
          "type": "text",
          "name": "employer_name",
          "title": "Employer Name",
          "visibleIf": "{employment_status} = Employed"
        },
        {
          "type": "text",
          "name": "annual_income",
          "title": "Annual Income",
          "inputType": "number",
          "description": "Enter amount in GBP",
          "visibleIf": "{employment_status} = Employed"
        }
      ]
    },
    {
      "name": "additionalNotes",
      "title": "Additional Notes",
      "elements": [
        {
          "type": "comment",
          "name": "additional_notes",
          "title": "Notes",
          "isRequired": false,
          "placeholder": "Any additional information..."
        }
      ]
    }
  ]
}
```

**Notes on this conversion:**
- The `mandatory` thank-you screen is omitted — the app shows its own completion state.
- `datatype: currency` became `"inputType": "number"` with a `description` note about currency.
- `show if: employment_status == 'Employed'` became `"visibleIf": "{employment_status} = Employed"` (single `=`, unquoted string value).
- `input type: area` became `"type": "comment"`.
- `datatype: date` became `"type": "text"` with `"inputType": "date"`.

---

## 8. LLM conversion prompt

Copy the prompt below into your LLM of choice, paste the Docassemble YAML after the final line, and the LLM will produce a valid survey JSON.

```
You are converting a Docassemble interview (YAML) into a survey definition JSON for a document assembly application.

RULES:
1. Output ONLY valid JSON — no commentary before or after.
2. The root object must have "title", "description", and "pages" keys.
3. Each page must have "name" (camelCase, no spaces), optional "title", optional "description", and "elements".
4. Each element must have "type" and "name".
5. Field type mapping:
   - Docassemble default text → { "type": "text" }
   - input type: area → { "type": "comment" }
   - datatype: date → { "type": "text", "inputType": "date" }
   - datatype: number or integer → { "type": "text", "inputType": "number" }
   - datatype: currency → { "type": "text", "inputType": "number" } (add description noting currency unit)
   - datatype: email → { "type": "text", "inputType": "email" }
   - datatype: yesno or top-level yesno → { "type": "boolean" }
   - datatype: noyes → { "type": "boolean" } — NOTE: invert all visibleIf references to this field
   - input type: radio or top-level choices → { "type": "radiogroup", "choices": [...] }
   - input type: dropdown or top-level dropdown → { "type": "dropdown", "choices": [...] }
   - datatype: checkboxes → { "type": "checkbox", "choices": [...] }
   - subquestion / instructional text → { "type": "html", "name": "...", "html": "<p>...</p>" }
6. Conditional logic:
   - "show if: var" → "visibleIf": "{var}"
   - "hide if: var" → "visibleIf": "!{var}"
   - "show if: var == 'value'" → "visibleIf": "{var} = value" (single =, no quotes around string values)
   - "show if: var == True" → "visibleIf": "{var} = true"
   - "show if: var == False" → "visibleIf": "{var} = false"
7. required: True → "isRequired": true; required: False or omitted → "isRequired": false
8. hint: → "placeholder":  |  help: → "description":  |  default: → "defaultValue":
9. Ignore: mandatory blocks, code blocks, role blocks, attachment blocks, signature fields, file fields.
10. Flatten DAObject attributes: user.name → user_name, client.address.city → client_address_city
11. Each question block in Docassemble = one page. Fields within one question block = elements on one page.
12. Use snake_case for all "name" values. Names must be unique across the entire survey.

DOCASSEMBLE YAML TO CONVERT:
[paste YAML here]
```
