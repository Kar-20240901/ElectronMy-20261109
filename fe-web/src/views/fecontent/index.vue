<script setup lang="ts">
import FeTitle from "./fe-title.vue";
import FeBody from "./fe-body.vue";

defineOptions({
  name: "FeContent",
});
</script>

<template>
  <div class="fe-content w-screen h-screen flex flex-col bg-white">
    <fe-title/>
    <fe-body/>
  </div>
</template>