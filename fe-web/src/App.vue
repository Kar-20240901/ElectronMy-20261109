<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn";
import FeContent from "./views/fecontent/index.vue";
</script>

<template>
  <el-config-provider :locale="zhCn">
    <fe-content/>
  </el-config-provider>
</template>
