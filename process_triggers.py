#!/usr/bin/env python3
import os
import re
import glob

def process_file(file_path):
    """Process a single SQL file to add DROP TRIGGER statements"""
    with open(file_path, 'r') as f:
        lines = f.readlines()

    new_lines = []
    i = 0
    changed = False

    while i < len(lines):
        line = lines[i]

        # Check if this line is a CREATE TRIGGER
        # Handle various CREATE TRIGGER patterns
        if re.match(r'^\s*CREATE\s+TRIGGER\s+', line, re.IGNORECASE):
            # Extract trigger name and table name from CREATE TRIGGER statement
            create_trigger_line = line.strip()

            # Keep reading until we get ON table_name part
            full_statement = create_trigger_line
            j = i + 1
            while j < len(lines) and not re.search(r'\s+ON\s+\w+', full_statement, re.IGNORECASE):
                full_statement += " " + lines[j].strip()
                j += 1

            # Try to extract trigger name and table name
            trigger_match = re.search(r'CREATE\s+TRIGGER\s+(\w+)\s+ON\s+(\w+)', full_statement, re.IGNORECASE)

            if trigger_match:
                trigger_name = trigger_match.group(1)
                table_name = trigger_match.group(2)

                # Check if DROP TRIGGER already exists on previous lines
                drop_exists = False
                for k in range(max(0, i-2), i):
                    if re.search(r'DROP\s+TRIGGER\s+IF\s+EXISTS\s+' + re.escape(trigger_name), lines[k], re.IGNORECASE):
                        drop_exists = True
                        break

                if not drop_exists:
                    # Add DROP TRIGGER statement
                    new_lines.append(f"DROP TRIGGER IF EXISTS \"{trigger_name}\" ON {table_name};\n")
                    changed = True

        new_lines.append(line)
        i += 1

    # Write back if content changed
    if changed:
        with open(file_path, 'w') as f:
            f.writelines(new_lines)
        return True
    return False

def main():
    # Find all SQL migration files (excluding backup directory)
    sql_files = []
    for file_path in glob.glob('supabase/migrations/*.sql'):
        if 'duplicates_backup' not in file_path:
            sql_files.append(file_path)

    processed_count = 0
    for file_path in sql_files:
        if process_file(file_path):
            processed_count += 1
            print(f"Updated: {file_path}")

    print(f"\nProcessed {processed_count} files with CREATE TRIGGER statements.")

if __name__ == "__main__":
    main()