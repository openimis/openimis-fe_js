#!/bin/bash

# Script to fix Fast Refresh issues in React components by adding named exports

cd ../frontend-packages

# Find all JSX files that have "export default"
find . -name "*.jsx" -exec grep -l "export default" {} \; | while read file; do
    echo "Processing $file"

    # Check if the file contains HOC patterns
    if grep -q "withModulesManager\|connect\|injectIntl\|withHistory" "$file"; then
        # Find the component name - prefer class components, then const/function
        component_name=$(grep -oP 'class\s+\K\w+' "$file" | head -1)
        if [ -z "$component_name" ]; then
            component_name=$(grep -oP '(const|function)\s+\K\w+(?=\s*[=(])' "$file" | head -1)
        fi

        if [ -n "$component_name" ]; then
            echo "  Found component: $component_name"

            # Check if named export already exists for this component
            if ! grep -q "export { $component_name };" "$file"; then
                # Also check if this identifier is already exported in any other way
                if ! grep -q "export.*$component_name" "$file"; then
                    # Add the named export before export default
                    sed -i "/export default/i export { $component_name };" "$file"
                    echo "  Added export { $component_name }; to $file"
                else
                    echo "  Identifier $component_name already exported in $file"
                fi
            else
                echo "  Named export already exists in $file"
            fi
        else
            echo "  Could not find component name in $file"
        fi
    else
        echo "  No HOCs found in $file"
    fi
done

echo "Done processing files."
