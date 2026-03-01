#!/bin/bash

# Merit Badge Generator Script
# Generates badges for all activities using Nano Banana API

#GEMINI_API_KEY=""

if [ -z "$GEMINI_API_KEY" ]; then
    echo "ERROR: GEMINI_API_KEY is not set."
    echo "Export it before running: export GEMINI_API_KEY='your-key-here'"
    exit 1
fi

TEMPLATE_PATH="/workspace/assets/images/activities/merit_badge_template.jpeg"
OUTPUT_DIR="/workspace/assets/images/activities"

# Encode template once
TEMPLATE_BASE64=$(base64 -w 0 "${TEMPLATE_PATH}")

generate_badge() {
    local id=$1
    local prompt=$2
    local output_file="${OUTPUT_DIR}/${id}-badge.png"

    # Skip if already exists
    if [ -f "$output_file" ]; then
        echo "SKIP: $id (already exists)"
        return 0
    fi

    echo "Generating: $id"

    # Build request JSON
    cat > /tmp/gemini-request.json << EOF
{
  "contents": [{
    "parts": [
      {"text": "${prompt}"},
      {"inline_data": {"mime_type": "image/jpeg", "data": "${TEMPLATE_BASE64}"}}
    ]
  }],
  "generationConfig": {
    "responseModalities": ["IMAGE"]
  }
}
EOF

    # Make API request
    curl -s -X POST \
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent" \
      -H "x-goog-api-key: $GEMINI_API_KEY" \
      -H "Content-Type: application/json" \
      -d @/tmp/gemini-request.json -o /tmp/gemini-response.json

    # Extract and save image
    IMAGE_DATA=$(jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' /tmp/gemini-response.json 2>/dev/null | head -1)

    if [ -n "$IMAGE_DATA" ] && [ "$IMAGE_DATA" != "null" ]; then
        echo "$IMAGE_DATA" | base64 -d > "${output_file}"
        echo "  SUCCESS: $(file -b "$output_file" | cut -d',' -f1)"
    else
        echo "  ERROR: Failed to generate"
        jq '.error.message // .candidates[0].finishReason // "Unknown error"' /tmp/gemini-response.json 2>/dev/null
        return 1
    fi

    # Small delay to avoid rate limiting
    sleep 2
}

echo "================================"
echo "Merit Badge Generator"
echo "================================"
echo ""

# Generate badges for each activity
generate_badge "old-town-albuquerque" \
    "Fill this circular merit badge with an embroidered illustration of a historic adobe church with a bell tower in southwestern style. Keep the woven tan border intact. Use a classic scout badge style with warm earth tones (terracotta, sand, turquoise sky)."

generate_badge "frontier-restaurant" \
    "Fill this circular merit badge with an embroidered illustration of a steaming cinnamon roll with a cup of coffee. Keep the woven tan border intact. Use a classic scout badge style with warm, appetizing colors (golden brown, cream, coffee colors)."

generate_badge "petroglyph-national-monument" \
    "Fill this circular merit badge with an embroidered illustration of ancient petroglyphs carved on volcanic rocks with desert landscape. Keep the woven tan border intact. Use a classic scout badge style with earthy desert colors (brown, tan, rust)."

generate_badge "indian-pueblo-cultural-center" \
    "Fill this circular merit badge with an embroidered illustration of a traditional Pueblo pottery design with geometric patterns. Keep the woven tan border intact. Use a classic scout badge style with traditional Pueblo colors (terracotta, black, cream)."

generate_badge "el-pinto" \
    "Fill this circular merit badge with an embroidered illustration of red and green chile peppers with a margarita glass. Keep the woven tan border intact. Use a classic scout badge style with vibrant colors (red, green, lime)."

generate_badge "balloon-museum" \
    "Fill this circular merit badge with an embroidered illustration of colorful hot air balloons floating in a blue sky. Keep the woven tan border intact. Use a classic scout badge style with bright, cheerful colors."

generate_badge "bosque-trail" \
    "Fill this circular merit badge with an embroidered illustration of a cyclist on a tree-lined trail along a river with cottonwood trees. Keep the woven tan border intact. Use a classic scout badge style with natural greens and blues."

generate_badge "tinkertown-museum" \
    "Fill this circular merit badge with an embroidered illustration of a whimsical miniature western town with a tiny wooden building and wagon wheel. Keep the woven tan border intact. Use a classic scout badge style with rustic, folk art colors."

generate_badge "meow-wolf" \
    "Fill this circular merit badge with an embroidered illustration of a mysterious glowing portal doorway with psychedelic colors. Keep the woven tan border intact. Use a classic scout badge style with vibrant purples, pinks, and electric blue."

generate_badge "tractor-brewing" \
    "Fill this circular merit badge with an embroidered illustration of a beer mug with foam next to a hop plant. Keep the woven tan border intact. Use a classic scout badge style with golden amber and green colors."

generate_badge "rio-grande-nature-center" \
    "Fill this circular merit badge with an embroidered illustration of a heron bird standing in water with reeds and trees. Keep the woven tan border intact. Use a classic scout badge style with natural blues and greens."

generate_badge "level-5" \
    "Fill this circular merit badge with an embroidered illustration of a rooftop dining scene with mountains in the sunset background. Keep the woven tan border intact. Use a classic scout badge style with sunset colors (orange, purple, gold)."

generate_badge "elena-gallegos-open-space" \
    "Fill this circular merit badge with an embroidered illustration of a hiker on a mountain trail with city views below. Keep the woven tan border intact. Use a classic scout badge style with mountain colors (green, brown, blue sky)."

generate_badge "range-cafe" \
    "Fill this circular merit badge with an embroidered illustration of a stack of pancakes with syrup and a coffee cup. Keep the woven tan border intact. Use a classic scout badge style with warm breakfast colors (golden, brown, cream)."

generate_badge "albuquerque-museum" \
    "Fill this circular merit badge with an embroidered illustration of a southwestern art sculpture in a garden setting. Keep the woven tan border intact. Use a classic scout badge style with artistic earth tones."

generate_badge "tent-rocks" \
    "Fill this circular merit badge with an embroidered illustration of cone-shaped tent rock formations in a slot canyon. Keep the woven tan border intact. Use a classic scout badge style with desert rock colors (tan, cream, rust)."

generate_badge "durans-station" \
    "Fill this circular merit badge with an embroidered illustration of a vintage lunch counter with a plate of enchiladas smothered in chile. Keep the woven tan border intact. Use a classic scout badge style with nostalgic diner colors."

generate_badge "sawmill-market" \
    "Fill this circular merit badge with an embroidered illustration of an artisan food hall interior with various food stalls. Keep the woven tan border intact. Use a classic scout badge style with warm, inviting colors."

echo ""
echo "================================"
echo "Badge generation complete!"
echo "================================"
