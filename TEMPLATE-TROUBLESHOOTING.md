# DOCX Template Troubleshooting Guide

## 🐛 **Template Issues Found**

Your `employment-contract-template.docx` has been detected and loaded successfully! However, there are formatting issues with the placeholders that need to be fixed.

## ⚠️ **Common Issues Detected**

### 1. **Duplicate Tags**
**Problem:** Multiple placeholder tags like `{{#ben`, `{{/ben`, etc.
**Cause:** Word may have split placeholders across multiple XML elements when you formatted text.

### 2. **Raw XML Tag Issues** 
**Problem:** Raw tags like `{{@index}}` need to be alone in their paragraph.
**Cause:** Extra text or spaces around raw tags.

## 🔧 **How to Fix Your Template**

### **Method 1: Simple Placeholder Fix (Recommended)**
1. **Open your DOCX** in Microsoft Word
2. **Find each placeholder** (like `{{employee_name}}`)
3. **Select the entire placeholder** including braces
4. **Type it fresh** - don't copy/paste
5. **Avoid formatting** the placeholder text (no bold, italics, etc.)
6. **Keep it simple** - just plain text

### **Method 2: Use Single Braces (Alternative)**
If you're having issues with double braces, try single braces:
- Change `{{employee_name}}` to `{employee_name}`
- Change `{{company_name}}` to `{company_name}`
- etc.

### **Method 3: Fix Specific Issues**

#### **For Loop/Array Placeholders:**
```
❌ Bad: {{#benefit_list}}{{.}}{{/benefit_list}}
✅ Good: Split into separate paragraphs:

{{#benefit_list}}
• {{.}}
{{/benefit_list}}
```

#### **For Conditional Placeholders:**
```
❌ Bad: Text {{#is_salary_based}}salary info{{/is_salary_based}} more text
✅ Good: Put conditions on separate lines:

{{#is_salary_based}}
Salary: ${{annual_salary}}
{{/is_salary_based}}
```

#### **For Index/Counter Tags:**
```
❌ Bad: {{@index}}. {{title}} {{description}}
✅ Good: Put @index alone:

{{@index}}
{{title}} - {{description}}
```

## 🧪 **Test Your Template**

After fixing, test your template:

```bash
npm run test:run -- tests/integration/document-generation.test.ts
```

Look for:
- ✅ "Using real DOCX template for tests"  
- ✅ "Real template processed successfully"
- ❌ No template error messages

## 📝 **Quick Template Validation**

Create a minimal test template with just these placeholders:
- `{employee_name}`
- `{company_name}`
- `{job_title}`
- `{start_date}`

Once that works, gradually add more complex features.

## 🎯 **Recommended Simple Template Structure**

```
EMPLOYMENT CONTRACT

Dear {employee_name},

We are pleased to offer you employment with {company_name} 
in the position of {job_title}.

Start Date: {start_date}
Department: {department}
Manager: {manager_name}

Sincerely,
{hr_manager_name}
{company_name}
```

## 🔍 **Advanced Debugging**

If you want to see exactly what's wrong, check the test output for:
- `duplicate_open_tag` - You have `{{` twice  
- `duplicate_close_tag` - You have `}}` twice
- `raw_xml_tag_should_be_only_text_in_paragraph` - Raw tags need their own line

## 💡 **Pro Tips**

1. **Keep placeholders simple** - avoid formatting them in Word
2. **Test frequently** - add one placeholder at a time
3. **Use plain text** - avoid Word's auto-formatting  
4. **Check for invisible characters** - sometimes Word adds hidden formatting
5. **Save as .docx** - not .doc or other formats

Once you fix the template, the tests should pass and show successful document generation! 🎉