<script setup lang="ts">
defineOptions({
  name: "FeBody",
});

export interface WinProcess {
  pid: number;
  name: string;
  path?: string;
}

onMounted(() => {
  window.ipcRenderer
    ?.invoke("electron:process:list")
    .then((list: WinProcess[]) => {
      console.log("程序列表", list);
    });
});
</script>

<template>
  <div class="fe-body flex-1 flex flex-col">
    <div></div>
  </div>
</template>
