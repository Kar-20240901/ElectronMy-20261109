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
import { ToastError, ToastSuccess } from "@/utils/ToastUtil.ts";
import type { FormInstance } from "element-plus";

defineOptions({
  name: "FeBody",
});

const processList = ref<WinProcess[]>([]);

const formData = ref<IFormData>({ killType: 201 });

const processListLoading = ref<boolean>(true);

const execLoading = ref<boolean>(false);

let initProcessListTimer: null | number = null;

onMounted(() => {
  initFormData();

  initProcessList();

  initKillProcessLogList();

  initProcessListTimer = setInterval(() => {
    initProcessList();
  }, 10000);
});

onUnmounted(() => {
  if (initProcessListTimer) {
    clearInterval(initProcessListTimer);
  }
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

function initProcessList() {
  processListLoading.value = true;

  processList.value = JSON.parse(localStorage.getItem(ProcessList) || "[]");

  window.ipcRenderer
    ?.invoke("electron:process:list")
    .then((list: WinProcess[]) => {
      if (!Array.isArray(list)) {
        ToastError(list);
        return;
      }

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
    })
    .finally(() => {
      processListLoading.value = false;
    });
}

function execOneClick() {
  const pName = formData.value.selectProcessPName;

  if (!pName) {
    ToastError("请选择要关闭的程序");
    return;
  }

  execLoading.value = true;

  window.ipcRenderer
    ?.invoke("electron:process:killProcessForPName", pName)
    .then((killRespBody: KillRespBody) => {
      addKillProcessLog(killRespBody, 101);

      initProcessList();

      if (killRespBody.stderr) {
        ToastError(killRespBody.stderr);
      } else {
        ToastSuccess("执行成功");
      }
    })
    .finally(() => {
      execLoading.value = false;
    });
}

function saveClick() {
  formRef.value?.validate().then((valid: boolean) => {
    if (!valid) {
      return;
    }

    localStorage.setItem(KillProcessFormData, JSON.stringify(formData.value));

    ToastSuccess("保存成功");
  });
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

  storageVal.unshift({
    timestamp: GetServerTimestamp(date),
    killPName: formData.value.selectProcessPName,
    killTime: FormatDateTimeFull(date),
    killRespBody: killRespBody,
    killType: logKillType,
  });

  killProcessLogList.value = storageVal;

  localStorage.setItem(KillProcessLogList, JSON.stringify(storageVal));
}

const killProcessLogList = ref<KillProcessLog[]>([]);

const formRef = ref<FormInstance>();

function clearClick() {
  formData.value = { killType: 201 };

  formRef.value?.clearValidate();

  localStorage.setItem(KillProcessFormData, JSON.stringify(formData.value));

  ToastSuccess("清除成功");
}
</script>

<template>
  <div class="fe-body flex-1 flex flex-col">
    <div class="flex flex-col mt-4">
      <div class="flex justify-center shrink-0">
        <el-form :model="formData" label-width="auto" ref="formRef">
          <el-form-item
            label="程序"
            prop="selectProcessPName"
            :rules="[{ required: true, message: '请选择程序' }]"
          >
            <div class="flex items-center">
              <div>
                <el-select-v2
                  v-model="formData.selectProcessPName"
                  placeholder="请选择"
                  class="!w-[220px]"
                  clearable
                  filterable
                  :options="processList"
                  :props="{
                    label: 'name',
                    value: 'name',
                  }"
                />
              </div>

              <div class="ml-3">
                <el-button
                  :loading="processListLoading"
                  size="small"
                  @click="initProcessList"
                  >刷新
                </el-button>
              </div>
            </div>
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
              <el-button @click="execOneClick">立即执行一次</el-button>
              <el-button type="primary" @click="saveClick">保存</el-button>
              <el-button type="danger" @click="clearClick">清除</el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div class="flex-1 flex flex-col text-gray-600 text-sm h-[100px]">
        <div class="mb-2">执行记录</div>
        <div class="flex flex-col gap-2 justify-center flex-1 overflow-y-auto">
          <div v-for="item in killProcessLogList" :key="item.timestamp">
            <div>killPName：{{ item.killPName }}</div>
            <div>killRespBody：{{ item.killRespBody }}</div>
            <div>killTime：{{ item.killTime }}</div>
            <div>
              killType：{{
                item.killType === 101
                  ? "手动执行"
                  : item.killType === 201
                    ? "循环一次"
                    : "一直循环"
              }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
