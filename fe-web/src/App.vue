<script setup lang="ts">
import zhCn from "element-plus/es/locale/lang/zh-cn";
import FeContent from "./views/fecontent/index.vue";
</script>

<template>
  <el-config-provider :locale="zhCn">
    <div>测试页面</div>
    <i-ep-plus/>
    <i-ep-search />
    <fe-content/>
  </el-config-provider>
</template>
