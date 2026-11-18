<script setup lang="ts">
import {
  type IFormData,
  type KillProcessLog,
  type KillRespBody,
  killTypeList,
  type TLogKillType,
  type WinProcess,
} from "@/views/fecontent/types.ts";
import {
  FormatDateTime,
  FormatDateTimeFull,
  FormatStringDateTime,
  GetServerTimestamp,
} from "@/utils/DateUtil.ts";
import { ToastError, ToastSuccess } from "@/utils/ToastUtil.ts";
import type { FormInstance } from "element-plus";

defineOptions({
  name: "FeBody",
});

const processList = ref<WinProcess[]>([]);

const formData = ref<IFormData>({ killType: 201 });

const localStorageFormData = ref<IFormData>({ killType: 201 });

const processListLoading = ref<boolean>(true);

const execLoading = ref<boolean>(false);

let initProcessListTimer: null | number = null;

let nextExecTimer: null | number = null;

const nextExecTimeStr = ref<string>("");

const nextExecFlag = ref<boolean>(false);

function getNextExecTimeStr(): string {
  return localStorage.getItem(NextExecTimeStr) || "";
}

onMounted(() => {
  nextExecTimeStr.value = getNextExecTimeStr();

  initFormData();

  initProcessList();

  initKillProcessLogList();

  initProcessListTimer = setInterval(() => {
    initProcessList();
  }, 10000);

  nextExecTimer = setInterval(() => {
    if (
      nextExecTimeStr.value &&
      GetServerTimestamp() >
        GetServerTimestamp(new Date(nextExecTimeStr.value)) &&
      nextExecFlag.value === false
    ) {
      if (localStorageFormData.value.killType === 301) {
        const date = new Date(localStorageFormData.value.killTime!);

        date.setDate(date.getDate() + 1);

        nextExecTimeStr.value = FormatDateTime(date);

        localStorage.setItem(NextExecTimeStr, nextExecTimeStr.value);
      } else {
        nextExecTimeStr.value = "";

        localStorage.removeItem(NextExecTimeStr);
      }

      nextExecFlag.value = true;

      execOneClick(
        localStorageFormData.value.selectProcessPName,
        localStorageFormData.value.killType,
      );
    }
  }, 2000);
});

onUnmounted(() => {
  if (initProcessListTimer) {
    clearInterval(initProcessListTimer);
  }

  if (nextExecTimer) {
    clearInterval(nextExecTimer);
  }
});

const KillProcessFormData = "KillProcessFormData";
const KillProcessLogList = "KillProcessLogList";
const ProcessList = "ProcessList";
const NextExecTimeStr = "NextExecTimeStr";

function initFormData() {
  formData.value = getKillProcessFormData();

  localStorageFormData.value = getKillProcessFormData();
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

function execOneClick(pName?: string, logKillType: TLogKillType = 101) {
  if (!pName) {
    pName = formData.value.selectProcessPName;
  }

  if (!pName) {
    ToastError("请选择要关闭的程序");
    return;
  }

  execLoading.value = true;

  window.ipcRenderer
    ?.invoke("electron:process:killProcessForPName", pName)
    .then((killRespBody: KillRespBody) => {
      addKillProcessLog(killRespBody, logKillType);

      initProcessList();

      if (killRespBody.stderr) {
        ToastError(killRespBody.stderr);
      } else {
        ToastSuccess("执行成功");
      }

      if (logKillType === 301) {
        nextExecFlag.value = false;
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

    localStorageFormData.value = { ...formData.value };

    ToastSuccess("保存成功");

    nextExecTimeStr.value = FormatDateTime(new Date(formData.value.killTime!));

    localStorage.setItem(NextExecTimeStr, nextExecTimeStr.value);

    nextExecFlag.value = false;
  });
}

function getKillProcessFormData(): IFormData {
  return JSON.parse(
    localStorage.getItem(KillProcessFormData) || '{"killType":201}',
  );
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

  localStorageFormData.value = { ...formData.value };

  formRef.value?.clearValidate();

  localStorage.setItem(KillProcessFormData, JSON.stringify(formData.value));

  ToastSuccess("清除成功");
}

function stopClick() {
  nextExecTimeStr.value = "";

  localStorage.removeItem(NextExecTimeStr);

  ToastSuccess("停止成功");
}
</script>

<template>
  <div class="fe-body flex-1 flex flex-col overflow-hidden">
    <div class="flex flex-col mt-4 flex-1 overflow-hidden">
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

              <div class="ml-3 w-[65px]">
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
              <el-button @click="execOneClick()">立即执行一次</el-button>
              <el-button type="primary" @click="saveClick">保存</el-button>
              <el-button type="danger" @click="clearClick">清除</el-button>
              <el-button @click="stopClick">停止</el-button>
              <el-popover
                placement="top"
                :width="localStorageFormData.selectProcessPName ? 270 : 250"
              >
                <template #default>
                  <div class="flex flex-col text-gray-600 text-sm">
                    <div class="w-full flex justify-center mb-2">当前循环</div>
                    <div
                      v-if="localStorageFormData.selectProcessPName"
                      class="flex flex-col"
                    >
                      <div>
                        程序：{{ localStorageFormData.selectProcessPName }}
                      </div>
                      <div>
                        循环类别：{{
                          localStorageFormData.killType === 201
                            ? "循环一次"
                            : "一直循环"
                        }}
                      </div>
                      <div>
                        循环时间：{{
                          FormatStringDateTime(localStorageFormData.killTime!)
                        }}
                      </div>
                      <div>下次执行时间：{{ nextExecTimeStr || "-" }}</div>
                    </div>
                    <div
                      v-else
                      class="w-full flex justify-center text-gray-500"
                    >
                      暂无循环
                    </div>
                  </div>
                </template>
                <template #reference>
                  <el-button>当前</el-button>
                </template>
              </el-popover>
            </div>
          </el-form-item>
        </el-form>
      </div>

      <div
        class="flex-1 flex flex-col text-gray-600 text-sm p-2 overflow-hidden"
      >
        <div class="mb-2 shrink-0">执行记录</div>
        <div class="flex flex-col gap-2 flex-1 overflow-auto">
          <div
            v-for="(item, index) in killProcessLogList"
            :key="item.timestamp"
          >
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

            <div
              v-if="index !== killProcessLogList.length - 1"
              class="border-t border-dashed border-gray-300 mt-2"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
