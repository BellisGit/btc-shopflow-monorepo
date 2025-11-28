from pathlib import Path

path = Path(".github/workflows/build-deploy-all-apps.yml")
text = path.read_text()
marker = "  # 步骤2: 每个应用独立构建和部署（8个并行Job）\n"

head, _ = text.split(marker, 1)

new_tail = """  # 步骤2: 每个应用独立构建和部署（8个并行Job）
  build-deploy-system-app:
    name: Build & Deploy system-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: system-app
      app_dir: apps/system-app
      app_port: "30080"
      container_name: btc-system-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-admin-app:
    name: Build & Deploy admin-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: admin-app
      app_dir: apps/admin-app
      app_port: "30081"
      container_name: btc-admin-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-logistics-app:
    name: Build & Deploy logistics-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: logistics-app
      app_dir: apps/logistics-app
      app_port: "30082"
      container_name: btc-logistics-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-quality-app:
    name: Build & Deploy quality-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: quality-app
      app_dir: apps/quality-app
      app_port: "30083"
      container_name: btc-quality-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-production-app:
    name: Build & Deploy production-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: production-app
      app_dir: apps/production-app
      app_port: "30084"
      container_name: btc-production-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-engineering-app:
    name: Build & Deploy engineering-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: engineering-app
      app_dir: apps/engineering-app
      app_port: "30085"
      container_name: btc-engineering-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-finance-app:
    name: Build & Deploy finance-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: finance-app
      app_dir: apps/finance-app
      app_port: "30086"
      container_name: btc-finance-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  build-deploy-mobile-app:
    name: Build & Deploy mobile-app
    needs: [detect-image-tag, build-shared-deps]
    uses: ./.github/workflows/build-deploy-app-reusable.yml
    with:
      app_name: mobile-app
      app_dir: apps/mobile-app
      app_port: "30091"
      container_name: btc-mobile-app
      image_tag: ${{ needs.detect-image-tag.outputs.image_tag }}
      registry: ${{ needs.detect-image-tag.outputs.registry }}
    secrets: inherit

  # 步骤3: 总结成功和失败的应用
  summary:
    name: Summary
    needs:
      - detect-image-tag
      - build-deploy-system-app
      - build-deploy-admin-app
      - build-deploy-logistics-app
      - build-deploy-quality-app
      - build-deploy-production-app
      - build-deploy-engineering-app
      - build-deploy-finance-app
      - build-deploy-mobile-app
    if: always()
    runs-on: ubuntu-latest
    permissions:
      contents: read
      checks: read
      actions: read
    outputs:
      successful_apps: ${{ steps.collect.outputs.successful_apps }}
      failed_apps: ${{ steps.collect.outputs.failed_apps }}
      total_apps: ${{ steps.collect.outputs.total_apps }}
      success_count: ${{ steps.collect.outputs.success_count }}
      fail_count: ${{ steps.collect.outputs.fail_count }}
    steps:
      - name: Collect results
        id: collect
        run: |
          APPS=("system-app" "admin-app" "logistics-app" "quality-app" "production-app" "engineering-app" "finance-app" "mobile-app")
          SUCCESSFUL_APPS=()
          FAILED_APPS=()

          echo "🔍 开始收集各应用的构建和部署结果..."

          for app in "${APPS[@]}"; do
            case "$app" in
              system-app)
                JOB_RESULT="${{ needs.build-deploy-system-app.result }}"
                ;;
              admin-app)
                JOB_RESULT="${{ needs.build-deploy-admin-app.result }}"
                ;;
              logistics-app)
                JOB_RESULT="${{ needs.build-deploy-logistics-app.result }}"
                ;;
              quality-app)
                JOB_RESULT="${{ needs.build-deploy-quality-app.result }}"
                ;;
              production-app)
                JOB_RESULT="${{ needs.build-deploy-production-app.result }}"
                ;;
              engineering-app)
                JOB_RESULT="${{ needs.build-deploy-engineering-app.result }}"
                ;;
              finance-app)
                JOB_RESULT="${{ needs.build-deploy-finance-app.result }}"
                ;;
              mobile-app)
                JOB_RESULT="${{ needs.build-deploy-mobile-app.result }}"
                ;;
              *)
                JOB_RESULT="unknown"
                ;;
            esac

            echo "  $app: $JOB_RESULT"

            if [ "$JOB_RESULT" = "success" ]; then
              SUCCESSFUL_APPS+=("$app")
              echo "✅ $app: 构建和部署都成功"
            else
              FAILED_APPS+=("$app")
              echo "❌ $app: 状态 = $JOB_RESULT"
            fi
          done

          if [ ${#SUCCESSFUL_APPS[@]} -gt 0 ]; then
            SUCCESSFUL_APPS_STR=$(IFS=','; echo "${SUCCESSFUL_APPS[*]}")
            echo "successful_apps=$SUCCESSFUL_APPS_STR" >> $GITHUB_OUTPUT
          else
            echo "successful_apps=" >> $GITHUB_OUTPUT
          fi

          if [ ${#FAILED_APPS[@]} -gt 0 ]; then
            FAILED_APPS_STR=$(IFS=','; echo "${FAILED_APPS[*]}")
            echo "failed_apps=$FAILED_APPS_STR" >> $GITHUB_OUTPUT
          else
            echo "failed_apps=" >> $GITHUB_OUTPUT
          fi

          echo "total_apps=${#APPS[@]}" >> $GITHUB_OUTPUT
          echo "success_count=${#SUCCESSFUL_APPS[@]}" >> $GITHUB_OUTPUT
          echo "fail_count=${#FAILED_APPS[@]}" >> $GITHUB_OUTPUT

          echo ""
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "📊 构建和部署结果汇总"
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
          echo "总应用数: ${#APPS[@]}"
          echo "成功: ${#SUCCESSFUL_APPS[@]}"
          echo "失败: ${#FAILED_APPS[@]}"
          echo ""
          if [ ${#SUCCESSFUL_APPS[@]} -gt 0 ]; then
            echo "✅ 成功应用:"
            for app in "${SUCCESSFUL_APPS[@]}"; do
              echo "  - $app"
            done
          fi
          echo ""
          if [ ${#FAILED_APPS[@]} -gt 0 ]; then
            echo "❌ 失败应用:"
            for app in "${FAILED_APPS[@]}"; do
              echo "  - $app"
            done
          fi
          echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

      - name: Generate summary report
        run: |
          SUMMARY_TITLE="## 📊 构建和部署结果汇总"
          STATS_INFO="### 统计信息"
          TOTAL_APPS_COUNT="${{ steps.collect.outputs.total_apps }}"
          SUCCESS_COUNT_VAL="${{ steps.collect.outputs.success_count }}"
          FAIL_COUNT_VAL="${{ steps.collect.outputs.fail_count }}"

          SUCCESS_APPS_HEADER="### ✅ 成功应用"
          SUCCESSFUL_APPS_STR="${{ steps.collect.outputs.successful_apps }}"

          FAILED_APPS_HEADER="### ❌ 失败应用"
          FAILED_APPS_STR="${{ steps.collect.outputs.failed_apps }}"

          DETAIL_INFO_HEADER="### 📋 详细信息"
          IMAGE_TAG_VAL="${{ needs.detect-image-tag.outputs.image_tag }}"
          REGISTRY_VAL="${{ needs.detect-image-tag.outputs.registry }}"
          GIT_SHA_VAL="${{ github.sha }}"

          {
            echo "$SUMMARY_TITLE"
            echo ""
            echo "$STATS_INFO"
            echo "- **总应用数**: $TOTAL_APPS_COUNT"
            echo "- **成功**: $SUCCESS_COUNT_VAL"
            echo "- **失败**: $FAIL_COUNT_VAL"
            echo ""

            if [ -n "$SUCCESSFUL_APPS_STR" ]; then
              echo "$SUCCESS_APPS_HEADER"
              IFS=',' read -ra APPS <<< "$SUCCESSFUL_APPS_STR"
              for app in "${APPS[@]}"; do
                echo "- \`$app\`"
              done
              echo ""
            fi

            if [ -n "$FAILED_APPS_STR" ]; then
              echo "$FAILED_APPS_HEADER"
              IFS=',' read -ra APPS <<< "$FAILED_APPS_STR"
              for app in "${APPS[@]}"; do
                echo "- \`$app\`"
              done
              echo ""
            fi

            echo "$DETAIL_INFO_HEADER"
            echo "- **镜像标签**: $IMAGE_TAG_VAL"
            echo "- **仓库**: $REGISTRY_VAL"
            echo "- **Git SHA**: $GIT_SHA_VAL"
          } >> $GITHUB_STEP_SUMMARY

"""

path.write_text(head + new_tail)

