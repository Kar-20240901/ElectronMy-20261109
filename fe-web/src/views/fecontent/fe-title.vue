<script setup lang="ts">
defineOptions({
  name: "FeTitle",
});

function toggleMaximize(){}
function minimize(){}
function close(){}
</script>

<template>
  <div class="fe-title w-full shrink-0 flex">
    <div
        ref="windowRef"
        class="fixed z-50 overflow-hidden rounded-lg bg-white shadow-2xl ring-1 ring-black/5 dark:bg-zinc-900"
    >
      <!-- 标题栏 -->
      <div
          ref="handleRef"
          class="flex h-10 select-none items-center justify-between bg-zinc-100 px-3 dark:bg-zinc-800"
          @dblclick="toggleMaximize"
      >
        <!-- 左侧标题 -->
        <div class="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <span class="font-medium">{{ title }}</span>
        </div>

        <!-- 右侧控制按钮 -->
        <div class="flex items-center">
          <button
              class="flex h-10 w-12 items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              title="最小化"
              @click="minimize"
          >
            <el-icon>
              <IconEpMinus/>
            </el-icon>
          </button>

          <button
              class="flex h-10 w-12 items-center justify-center text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              :title="isMaximized ? '还原' : '最大化'"
              @click="toggleMaximize"
          >
            <el-icon>
              <IconEpFullScreen v-if="!isMaximized"/>
              <IconEpCopyDocument v-else/>
            </el-icon>
          </button>

          <button
              class="flex h-10 w-12 items-center justify-center text-zinc-500 hover:bg-red-500 hover:text-white"
              title="关闭"
              @click="close"
          >
            <el-icon>
              <IconEpClose/>
            </el-icon>
          </button>
        </div>
      </div>

      <!-- 内容区 -->
      <div class="h-[calc(100%-2.5rem)] overflow-auto p-4">
        <slot/>
      </div>
    </div>
  </div>
</template>