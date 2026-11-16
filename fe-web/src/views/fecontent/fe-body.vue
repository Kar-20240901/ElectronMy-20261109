<script setup lang="ts">
import {
  type IFormData,
  type KillProcessLog,
  killTypeList,
  type WinProcess,
} from "@/views/fecontent/types.ts";

defineOptions({
  name: "FeBody",
});

const processList = ref<WinProcess[]>([]);

const formData = ref<IFormData>({ killType: 201 });

const loading = ref<boolean>(true);

onMounted(() => {
  getProcessList();
});

function getProcessList() {
  loading.value = true;

  window.ipcRenderer
    ?.invoke("electron:process:list")
    .then((list: WinProcess[]) => {
      processList.value = list || [];
      loading.value = false;
    });
}

function execOneClick() {}

function saveClick() {}

const killProcessLogList = ref<KillProcessLog[]>([]);
</script>

<template>
  <div class="fe-body flex-1 flex flex-col">
    <div class="flex flex-col items-center mt-4">
      <el-form :model="formData" label-width="auto">
        <el-form-item
          label="程序"
          prop="selectProcess"
          :rules="[{ required: true, message: '请选择程序' }]"
        >
          <el-select-v2
            v-model="formData.selectProcess"
            placeholder="请选择"
            class="!w-[220px]"
            clearable
            filterable
            :options="processList"
            :loading="loading"
            :props="{
              label: 'name',
              value: 'pid',
            }"
          />
        </el-form-item>

        <el-form-item
          label="循环类别"
          prop="killType"
          :rules="[{ required: true, message: '请选择循环类别' }]"
        >
          <el-select-v2
            v-model="formData.killType"
            placeholder="请选择"
            class="!w-[220px]"
            :options="killTypeList"
          />
        </el-form-item>

        <el-form-item
          label="循环时间"
          prop="killTime"
          :rules="[{ required: true, message: '请选择循环时间' }]"
        >
          <el-date-picker
            v-model="formData.killTime"
            type="datetime"
            placeholder="请选择"
          />
        </el-form-item>

        <el-form-item>
          <div class="flex-1 flex items-center gap-1 justify-center">
            <el-button @click="execOneClick"> 立即执行一次</el-button>
            <el-button type="primary" @click="saveClick">保存</el-button>
          </div>
        </el-form-item>
      </el-form>

      <div
        class="flex-1 flex flex-col items-center gap-1 text-gray-600 text-sm"
      >
        <div>执行记录</div>
        <div v-for="item in killProcessLogList" :key="item.timestamp">
          <div>killPid：{{ item.killPid }}</div>
          <div>killPName：{{ item.killPName }}</div>
          <div>killPPath：{{ item.killPPath }}</div>
          <div>killRespBody：{{ item.killRespBody }}</div>
          <div>killTime：{{ item.killTime }}</div>
          <div>killType：{{ item.killType }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
