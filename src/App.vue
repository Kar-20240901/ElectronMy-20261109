<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn";
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div class="w-full h-full flex items-center justify-center">
      测试页面
      <span class="icon-[mdi--access-point] ml-1"></span>
    </div>
  </el-config-provider>
</template>
