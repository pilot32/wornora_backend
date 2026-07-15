#!/bin/bash

# Configuration: Replace these variables before running
GITHUB_TOKEN="YOUR_GITHUB_TOKEN_HERE"
REPO_OWNER="YOUR_GITHUB_USERNAME_OR_ORG"
REPO_NAME="YOUR_REPOSITORY_NAME"

# Check if required variables are set
if [[ "$GITHUB_TOKEN" == "YOUR_GITHUB_TOKEN_HERE" || -z "$GITHUB_TOKEN" ]]; then
    echo "Error: Please set your GITHUB_TOKEN in the script."
    exit 1
fi

if [[ "$REPO_OWNER" == "YOUR_GITHUB_USERNAME_OR_ORG" || -z "$REPO_OWNER" ]]; then
    echo "Error: Please set your REPO_OWNER in the script."
    exit 1
fi

if [[ "$REPO_NAME" == "YOUR_REPOSITORY_NAME" || -z "$REPO_NAME" ]]; then
    echo "Error: Please set your REPO_NAME in the script."
    exit 1
fi

API_URL="https://api.github.com/repos/$REPO_OWNER/$REPO_NAME/issues"

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"

    echo "Creating issue: $title..."

    # Escape quotes for JSON
    local escaped_title=$(echo "$title" | sed 's/"/\\"/g')
    local escaped_body=$(echo "$body" | sed 's/"/\\"/g' | sed ':a;N;$!ba;s/\n/\\n/g')

    response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
        -H "Authorization: token $GITHUB_TOKEN" \
        -H "Accept: application/vnd.github.v3+json" \
        -d "{\"title\":\"$escaped_title\",\"body\":\"$escaped_body\",\"labels\":[\"bug\",\"security\"]}")

    http_code=$(echo "$response" | tail -n1)

    if [[ "$http_code" -eq 201 ]]; then
        echo "✅ Issue created successfully!"
    else
        echo "❌ Failed to create issue. HTTP Code: $http_code"
        echo "Response: $(echo "$response" | sed '$d')"
    fi
    echo "-----------------------------------"
    sleep 1 # Avoid hitting rate limits too quickly
}

# 1. Broken Customer Product Endpoint
create_issue "Bug: Broken Customer Product Endpoint (Crash)" "The \`getProductById\` in \`customer.controller.js\` queries \`id: req.params.id\` (should be \`_id\`) and chains \`.populater('subcategoryId','name')\` (should be \`.populate\`). Calling this endpoint will immediately crash the request."

# 2. Unprotected Category Status Route
create_issue "Security: Unprotected Category Status Route" "Missing authentication middlewares on the \`/:id/status\` category route means any anonymous user can disable entire product categories. Need to add \`authMiddleware\` and \`roleMiddleware('ADMIN')\`."

# 3. Password Hash Leak
create_issue "Security: Password Hash Leak on Login" "The login route returns the entire user document, exposing the encrypted password to the frontend/clients. We need to exclude the password before returning the response."

# 4. Missing E-Commerce Flow
create_issue "Feature: Missing Core E-Commerce Flow" "The platform is currently missing cart, checkout, order, and payment logic. Users cannot purchase products."

# 5. No Request Data Validation
create_issue "Security/Bug: Missing Request Data Validation" "The application has \`zod\` installed but never uses it. The lack of validation means bad data can corrupt the database, bypass intent, or allow NoSQL injection."

# 6. Open CORS & Missing Security Headers
create_issue "Security: Open CORS & Missing Security Headers" "Using \`origin: '*'\` with credentials enabled opens the door to severe cross-site request forgery (CSRF) and cross-origin attacks. Need to restrict CORS and add helmet."

# 7. Unbounded Memory File Uploads
create_issue "Security: Unbounded Memory File Uploads (DoS Risk)" "A missing file size limit in Multer (\`uploadImage\`) allows attackers to execute a Denial of Service (DoS) by uploading massive files that crash the server's memory limits. Need to add \`limits: { fileSize: ... }\`."

# 8. Hard Deletes Causing Orphaned Data
create_issue "Bug: Hard Deletes Result in Orphaned Data" "Deleting a category completely breaks the frontend by leaving orphaned subcategories and products with unresolvable relationships. Need to implement soft deletes."

# 9. Leaking Stack Traces to Clients
create_issue "Security/Bug: Leaking Internal Stack Traces to Clients" "Sending \`err.message\` on 500 status codes exposes internal architecture and Mongoose validation details to end users. We need a centralized error handler."

# 10. Schema Typo in User Model
create_issue "Bug: Schema Typo Prevents Timestamp Generation" "Misspelling \`timestamps\` as \`timeStamps\` in the User model prevents Mongoose from recording user creation/update dates."

echo "Finished processing issues!"
