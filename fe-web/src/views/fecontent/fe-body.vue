<script setup lang="ts">
import {
  type IFormData,
  type KillProcessLog,
  type KillRespBody,
  killTypeList,
  type TLogKillType,
  type WinProcess,
} from "@/views/fecontent/types.ts";
import { FormatDateTimeFull, GetServerTimestamp } from "@/utils/DateUtil.ts";
import { ToastError } from "@/utils/ToastUtil.ts";

defineOptions({
  name: "FeBody",
});

const processList = ref<WinProcess[]>([]);

const formData = ref<IFormData>({ killType: 201 });

const execLoading = ref<boolean>(false);

onMounted(() => {
  initFormData();

  initProcessList();

  initKillProcessLogList();
});

const KillProcessFormData = "KillProcessFormData";
const KillProcessLogList = "KillProcessLogList";
const ProcessList = "ProcessList";

function initFormData() {
  formData.value = JSON.parse(
    localStorage.getItem(KillProcessFormData) || '{"killType":201}',
  );
}

function initKillProcessLogList() {
  killProcessLogList.value = JSON.parse(
    localStorage.getItem(KillProcessLogList) || "[]",
  );
}

let processMap = new Map<number, WinProcess>();

watch(
  processList,
  () => {
    processMap = new Map(processList.value.map((item) => [item.pid!, item]));
  },
  { deep: true, immediate: true },
);

function initProcessList() {
  processList.value = JSON.parse(localStorage.getItem(ProcessList) || "[]");

  window.ipcRenderer
    ?.invoke("electron:process:list")
    .then((list: WinProcess[]) => {
      const tempList = list || [];

      const uniqueList = [];
      const nameSet = new Set();

      for (const item of tempList) {
        if (!nameSet.has(item.name)) {
          nameSet.add(item.name);
          uniqueList.push(item);
        }
      }

      processList.value = uniqueList;

      localStorage.setItem(ProcessList, JSON.stringify(processList.value));
    });
}

function execOneClick() {
  const pName = formData.value.selectProcess?.name;

  if (!pName) {
    ToastError("请选择要关闭的程序");
    return;
  }

  execLoading.value = true;

  window.ipcRenderer
    ?.invoke("electron:process:killProcessForPName", pName)
    .then((killRespBody: KillRespBody) => {
      console.log("killRespBody", killRespBody);

      addKillProcessLog(killRespBody, 101);
    })
    .finally(() => {
      execLoading.value = false;
    });
}

function saveClick() {
  localStorage.setItem(KillProcessFormData, JSON.stringify(formData.value));
}

function selectProcessPidChange(pid: number) {
  const item = processMap.get(pid);

  if (item) {
    formData.value.selectProcess = item;
  }
}

function addKillProcessLog(
  killRespBody: KillRespBody,
  logKillType: TLogKillType,
) {
  let storageVal: KillProcessLog[] = JSON.parse(
    localStorage.getItem(KillProcessLogList) || "[]",
  );

  if (storageVal.length > 100) {
    storageVal = storageVal.slice(0, 99);
  }

  const date = new Date();

  storageVal.push({
    timestamp: GetServerTimestamp(date),
    killPid: formData.value.selectProcess?.pid,
    killPName: formData.value.selectProcess?.name,
    killPPath: formData.value.selectProcess?.path,
    killTime: FormatDateTimeFull(date),
    killRespBody: killRespBody,
    killType: logKillType,
  });

  killProcessLogList.value = storageVal;

  localStorage.setItem(KillProcessLogList, JSON.stringify(storageVal));
}

const killProcessLogList = ref<KillProcessLog[]>([]);
</script>

<template>
  <div class="fe-body flex-1 flex flex-col">
    <div class="flex flex-col items-center mt-4">
      <el-form :model="formData" label-width="auto">
        <el-form-item
          label="程序"
          prop="selectProcessPid"
          :rules="[{ required: true, message: '请选择程序' }]"
        >
          <el-select-v2
            v-model="formData.selectProcessPid"
            placeholder="请选择"
            class="!w-[220px]"
            clearable
            filterable
            :options="processList"
            :props="{
              label: 'name',
              value: 'pid',
            }"
            @change="selectProcessPidChange"
          >
            <template #label="{ label, value }">
              <div class="w-full h-full flex items-center">
                <div class="text-sm mr-2">
                  {{ label }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ value }}
                </div>
              </div>
            </template>

            <template #default="{ item }">
              <div class="w-full h-full flex items-center">
                <div class="text-sm mr-2">
                  {{ item?.name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ item?.pid }}
                </div>
              </div>
            </template>
          </el-select-v2>
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
