#!/bin/bash
# Converts photos/ images into assets.js (base64 embedded)

DIR="photos"
OUT="assets.js"

echo "const PHOTOS = [" > "$OUT"

first=true
shopt -s nullglob
for f in "$DIR"/*.jpg "$DIR"/*.jpeg "$DIR"/*.png "$DIR"/*.webp "$DIR"/*.JPG "$DIR"/*.JPEG "$DIR"/*.PNG "$DIR"/*.WEBP; do
  [ -f "$f" ] || continue

  ext="${f##*.}"
  case "${ext,,}" in
    jpg|jpeg) mime="image/jpeg" ;;
    png)      mime="image/png" ;;
    webp)     mime="image/webp" ;;
    *)        mime="image/jpeg" ;;
  esac

  base64_data=$(base64 -w 0 "$f")

  if [ "$first" = true ]; then
    first=false
  else
    echo "," >> "$OUT"
  fi

  printf '  "data:%s;base64,%s"' "$mime" "$base64_data" >> "$OUT"
done

echo "" >> "$OUT"
echo "];" >> "$OUT"

count=$(grep -c "data:" "$OUT")
echo "Built assets.js with $count photos"
