<script setup lang="ts">
import { useDraggable } from "@vueuse/core";

defineOptions({
  name: "FeTitle",
});

const title = ref<string>("...");
const isMaximized = ref<boolean>(false);

function minimizeClick() {}

function toggleMaximizeClick() {}

function closeClick() {}

const titleBar = ref(null);

useDraggable(titleBar, {
  onStart() {
    console.log("开始拖动");
  },
});
</script>

<template>
  <div
    ref="titleBar"
    class="fe-title w-full shrink-0 h-11 px-3 flex items-center justify-between bg-gradient-to-r from-white/70 to-gray-100/70 border-b border-gray-300/70"
  >
    <div class="flex items-center gap-2">
      <div
        class="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 shadow-inner"
      ></div>
      <span class="text-sm font-semibold text-gray-700 tracking-wide">
        {{ title }}
      </span>
    </div>

    <div class="flex items-center gap-1">
      <div
        @click="minimizeClick"
        class="group w-11 h-9 flex items-center justify-center rounded-md text-gray-600 hover:bg-black/5 transition"
      >
        <span
          class="icon-[mdi--window-minimize] text-[18px] group-hover:scale-110 transition"
        />
      </div>

      <div
        @click="toggleMaximizeClick"
        class="group w-11 h-9 flex items-center justify-center rounded-md text-gray-600 hover:bg-black/5 transition"
      >
        <span
          :class="
            isMaximized
              ? 'icon-[mdi--window-restore]'
              : 'icon-[mdi--window-maximize]'
          "
          class="text-[18px] group-hover:scale-110 transition"
        />
      </div>

      <div
        @click="closeClick"
        class="group w-11 h-9 flex items-center justify-center rounded-md text-gray-600 hover:bg-black/5 transition"
      >
        <span
          class="icon-[mdi--close] text-[18px] group-hover:scale-120 transition"
        />
      </div>
    </div>
  </div>
</template>
