<script lang="ts" setup>
import type { Module, Project, PublicAccount } from '#/types/domain';

import { computed, reactive, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Alert,
  Button,
  Card,
  Form,
  FormItem,
  Input,
  Popconfirm,
  Select,
  Table,
  Tag,
} from 'ant-design-vue';

import { $t } from '#/locales';
import { useAccountStore } from '#/store/accounts';
import { useFolderStore } from '#/store/folders';
import { useModuleStore } from '#/store/modules';
import { useProjectStore } from '#/store/projects';
import { PORTALS } from '#/utils/constants';
import { isFileSystemAccessSupported, pickDirectory } from '#/utils/fileSystem';
import { toast } from '#/utils/toast';

const projectStore = useProjectStore();
const accountStore = useAccountStore();
const folderStore = useFolderStore();
const moduleStore = useModuleStore();

const supported = isFileSystemAccessSupported();

function projectRowKey(record: Project) {
  return record.id;
}
function accountRowKey(record: PublicAccount) {
  return record.username;
}

const portals = [
  { value: PORTALS.EXTERNAL, label: $t('autest.general.external') },
  { value: PORTALS.INTERNAL, label: $t('autest.general.internal') },
];

async function connect(portal: string) {
  try {
    const handle = await pickDirectory();
    folderStore.setHandle(portal, handle);
    toast.success(
      `${handle.name} ${$t('autest.folders.connected').toLowerCase()}`,
    );
  } catch (error) {
    if ((error as Error).name !== 'AbortError') {
      toast.error((error as Error).message);
    }
  }
}

function folderPath(portal: string) {
  return folderStore.isConnected(portal)
    ? `${folderStore.names[portal]}/tests/`
    : $t('autest.folders.notConnected');
}

// --- Admin: projects ---
const newProjectName = ref('');
function addProject() {
  try {
    projectStore.addProject(newProjectName.value);
    toast.success('Project added');
    newProjectName.value = '';
  } catch (error) {
    toast.error((error as Error).message);
  }
}

const projectColumns = [
  { title: $t('autest.settings.project'), dataIndex: 'name', key: 'name' },
  { title: $t('autest.settings.members'), key: 'members', width: 120 },
];

// --- Admin: users ---
const roleOptions = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
];
const newUser = reactive({
  username: '',
  password: '',
  realName: '',
  role: 'user',
});
function addUser() {
  try {
    accountStore.addAccount({
      username: newUser.username,
      password: newUser.password,
      realName: newUser.realName,
      roles: [newUser.role],
    });
    toast.success('User added');
    newUser.username = '';
    newUser.password = '';
    newUser.realName = '';
    newUser.role = 'user';
  } catch (error) {
    toast.error((error as Error).message);
  }
}

const userColumns = [
  { title: $t('autest.auth.username'), dataIndex: 'username', key: 'username' },
  { title: 'Name', dataIndex: 'realName', key: 'realName' },
  { title: 'Roles', key: 'roles', width: 140 },
];

// --- Admin: membership (scales to many members) ---
const membershipProjectId = ref<string>(projectStore.currentProjectId ?? '');
const memberSearch = ref('');
const addMembers = ref<string[]>([]);

const projectOptions = computed(() =>
  projectStore.projects.map((p) => ({ label: p.name, value: p.id })),
);

const membershipProject = computed(() =>
  projectStore.projects.find((p) => p.id === membershipProjectId.value),
);

const accountByName = computed<Record<string, PublicAccount>>(() =>
  Object.fromEntries(accountStore.publicList.map((a) => [a.username, a])),
);

const memberCount = computed(
  () => membershipProject.value?.members.length ?? 0,
);

const members = computed<PublicAccount[]>(() => {
  const list = (membershipProject.value?.members ?? []).map(
    (u) =>
      accountByName.value[u] ?? { username: u, realName: u, roles: ['user'] },
  );
  const q = memberSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (a) =>
      a.username.toLowerCase().includes(q) ||
      a.realName.toLowerCase().includes(q),
  );
});

const nonMemberOptions = computed(() => {
  const set = new Set(membershipProject.value?.members);
  return accountStore.publicList
    .filter((a) => !set.has(a.username))
    .map((a) => ({
      label: `${a.realName} (${a.username})`,
      value: a.username,
    }));
});

const memberColumns = [
  { title: $t('autest.auth.username'), dataIndex: 'username', key: 'username' },
  { title: 'Name', dataIndex: 'realName', key: 'realName' },
  { title: 'Roles', key: 'roles', width: 120 },
  { title: '', key: 'actions', width: 90 },
];

function assignSelected() {
  if (addMembers.value.length === 0) return;
  const count = addMembers.value.length;
  try {
    addMembers.value.forEach((u) =>
      projectStore.assignUser(membershipProjectId.value, u),
    );
    toast.success(`Added ${count} member${count > 1 ? 's' : ''}`);
    addMembers.value = [];
  } catch (error) {
    toast.error((error as Error).message);
  }
}

function unassign(username: string) {
  try {
    projectStore.unassignUser(membershipProjectId.value, username);
  } catch (error) {
    toast.error((error as Error).message);
  }
}

// --- Admin: modules (per project) ---
function moduleRowKey(record: Module) {
  return record.id;
}

const moduleProjectId = ref<string>(projectStore.currentProjectId ?? '');
const newModuleName = ref('');

const moduleList = computed<Module[]>(() =>
  moduleStore.modulesOf(moduleProjectId.value),
);

function addModule() {
  try {
    moduleStore.addModule(newModuleName.value, moduleProjectId.value);
    toast.success('Module added');
    newModuleName.value = '';
  } catch (error) {
    toast.error((error as Error).message);
  }
}

function renameModule(id: string, name: string) {
  try {
    moduleStore.renameModule(id, name);
  } catch (error) {
    toast.error((error as Error).message);
  }
}

function removeModule(id: string) {
  try {
    moduleStore.removeModule(id);
    if (selectedModuleId.value === id) selectedModuleId.value = '';
  } catch (error) {
    toast.error((error as Error).message);
  }
}

const moduleColumns = [
  { title: $t('autest.brs.module'), dataIndex: 'name', key: 'name' },
  { title: 'BRS', key: 'brs', width: 80 },
  { title: $t('autest.settings.members'), key: 'members', width: 90 },
  { title: '', key: 'actions', width: 90 },
];

// --- Admin: module membership (members are a subset of project members) ---
const selectedModuleId = ref<string>('');
const addModuleMembers = ref<string[]>([]);
const moduleMemberSearch = ref('');

const moduleOptions = computed(() =>
  moduleList.value.map((m) => ({ label: m.name, value: m.id })),
);

const selectedModule = computed(() =>
  moduleList.value.find((m) => m.id === selectedModuleId.value),
);

const moduleMembers = computed<PublicAccount[]>(() => {
  const list = (selectedModule.value?.members ?? []).map(
    (u) =>
      accountByName.value[u] ?? { username: u, realName: u, roles: ['user'] },
  );
  const q = moduleMemberSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    (a) =>
      a.username.toLowerCase().includes(q) ||
      a.realName.toLowerCase().includes(q),
  );
});

// Only the project's members can be added to one of its modules.
const moduleCandidateOptions = computed(() => {
  if (!selectedModule.value) return [];
  const inModule = new Set(selectedModule.value.members);
  return projectStore
    .membersOf(moduleProjectId.value)
    .filter((u) => !inModule.has(u))
    .map((u) => {
      const a = accountByName.value[u];
      return { label: a ? `${a.realName} (${u})` : u, value: u };
    });
});

function assignModuleMembers() {
  if (!selectedModuleId.value || addModuleMembers.value.length === 0) return;
  const count = addModuleMembers.value.length;
  try {
    addModuleMembers.value.forEach((u) =>
      moduleStore.assignMember(selectedModuleId.value, u),
    );
    toast.success(`Added ${count} member${count > 1 ? 's' : ''}`);
    addModuleMembers.value = [];
  } catch (error) {
    toast.error((error as Error).message);
  }
}

function unassignModuleMember(username: string) {
  try {
    moduleStore.unassignMember(selectedModuleId.value, username);
  } catch (error) {
    toast.error((error as Error).message);
  }
}
</script>

<template>
  <Page :title="$t('autest.settings.title')">
    <!-- Portal folders -->
    <Card
      :title="`${$t('autest.folders.title')}${projectStore.currentProject ? ` — ${projectStore.currentProject.name}` : ''}`"
      class="mb-4"
    >
      <Alert
        v-if="!supported"
        type="warning"
        :message="$t('autest.folders.unsupported')"
        show-icon
        class="mb-3"
      />
      <p class="muted mb-3">{{ $t('autest.folders.info') }}</p>

      <div class="folder-grid">
        <div v-for="p in portals" :key="p.value" class="folder-row">
          <div>
            <div class="folder-name">{{ p.label }}</div>
            <div
              class="folder-path"
              :class="{ connected: folderStore.isConnected(p.value) }"
            >
              {{ folderPath(p.value) }}
            </div>
          </div>
          <Button :disabled="!supported" @click="connect(p.value)">
            {{
              folderStore.isConnected(p.value)
                ? $t('autest.folders.reconnect')
                : $t('autest.folders.connect')
            }}
          </Button>
        </div>
      </div>
      <p class="muted mt-2 text-xs">
        Browsers expose only the folder name, not the full disk path; specs are
        written to &lt;folder&gt;/tests/.
      </p>
    </Card>

    <!-- Admin area -->
    <template v-if="projectStore.isAdmin">
      <Card :title="$t('autest.settings.projects')" class="mb-4">
        <div class="add-row">
          <Input
            v-model:value="newProjectName"
            :placeholder="$t('autest.settings.newProject')"
          />
          <Button type="primary" @click="addProject">
            {{ $t('autest.general.save') }}
          </Button>
        </div>
        <Table
          :columns="projectColumns"
          :data-source="projectStore.projects"
          :row-key="projectRowKey"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'members'">
              {{ record.members.length }}
            </template>
          </template>
        </Table>
      </Card>

      <Card :title="$t('autest.settings.users')" class="mb-4">
        <Form layout="vertical">
          <div class="user-grid">
            <FormItem :label="$t('autest.auth.username')">
              <Input v-model:value="newUser.username" />
            </FormItem>
            <FormItem :label="$t('autest.auth.password')">
              <Input v-model:value="newUser.password" />
            </FormItem>
            <FormItem label="Name">
              <Input v-model:value="newUser.realName" />
            </FormItem>
            <FormItem label="Role">
              <Select v-model:value="newUser.role" :options="roleOptions" />
            </FormItem>
            <FormItem label=" ">
              <Button type="primary" block @click="addUser">
                {{ $t('autest.general.save') }}
              </Button>
            </FormItem>
          </div>
        </Form>
        <Table
          :columns="userColumns"
          :data-source="accountStore.publicList"
          :row-key="accountRowKey"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'roles'">
              <Tag
                v-for="role in record.roles"
                :key="role"
                :color="role === 'admin' ? 'purple' : 'default'"
              >
                {{ role }}
              </Tag>
            </template>
          </template>
        </Table>
      </Card>

      <Card class="mb-4">
        <template #title>
          {{ $t('autest.settings.membership') }}
          <Tag color="blue" class="ml-2">{{ memberCount }} members</Tag>
        </template>

        <div class="membership-controls">
          <Select
            v-model:value="membershipProjectId"
            :options="projectOptions"
            :placeholder="$t('autest.settings.project')"
            class="project-select"
          />
        </div>

        <div class="add-row mt-3">
          <Select
            v-model:value="addMembers"
            mode="multiple"
            :options="nonMemberOptions"
            :placeholder="$t('autest.settings.addMember')"
            option-filter-prop="label"
            class="member-add"
          />
          <Button
            type="primary"
            :disabled="addMembers.length === 0"
            @click="assignSelected"
          >
            {{ $t('autest.settings.assign') }}
          </Button>
        </div>

        <Input
          v-model:value="memberSearch"
          :placeholder="$t('autest.general.search')"
          allow-clear
          class="member-search mt-3"
        />

        <Table
          :columns="memberColumns"
          :data-source="members"
          :row-key="accountRowKey"
          :pagination="{ pageSize: 10, hideOnSinglePage: true }"
          size="small"
          class="mt-2"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'roles'">
              <Tag
                v-for="role in record.roles"
                :key="role"
                :color="role === 'admin' ? 'purple' : 'default'"
              >
                {{ role }}
              </Tag>
            </template>
            <template v-else-if="column.key === 'actions'">
              <Button danger size="small" @click="unassign(record.username)">
                {{ $t('autest.general.remove') }}
              </Button>
            </template>
          </template>
        </Table>
      </Card>

      <!-- Modules -->
      <Card :title="$t('autest.settings.modules')" class="mb-4">
        <div class="membership-controls">
          <Select
            v-model:value="moduleProjectId"
            :options="projectOptions"
            :placeholder="$t('autest.settings.project')"
            class="project-select"
          />
        </div>

        <div class="add-row mt-3">
          <Input
            v-model:value="newModuleName"
            :placeholder="$t('autest.settings.newModule')"
          />
          <Button type="primary" @click="addModule">
            {{ $t('autest.general.save') }}
          </Button>
        </div>

        <Table
          :columns="moduleColumns"
          :data-source="moduleList"
          :row-key="moduleRowKey"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'name'">
              <Input
                :value="record.name"
                :bordered="false"
                @update:value="(v) => renameModule(record.id, v)"
              />
            </template>
            <template v-else-if="column.key === 'brs'">
              {{ record.brsList.length }}
            </template>
            <template v-else-if="column.key === 'members'">
              {{ record.members.length }}
            </template>
            <template v-else-if="column.key === 'actions'">
              <Popconfirm
                :title="$t('autest.settings.removeModule')"
                @confirm="removeModule(record.id)"
              >
                <Button danger size="small">
                  {{ $t('autest.general.remove') }}
                </Button>
              </Popconfirm>
            </template>
          </template>
        </Table>
      </Card>

      <!-- Module membership -->
      <Card :title="$t('autest.settings.moduleMembership')" class="mb-4">
        <div class="membership-controls">
          <Select
            v-model:value="selectedModuleId"
            :options="moduleOptions"
            :placeholder="$t('autest.brs.module')"
            class="project-select"
          />
        </div>

        <template v-if="selectedModule">
          <div class="add-row mt-3">
            <Select
              v-model:value="addModuleMembers"
              mode="multiple"
              :options="moduleCandidateOptions"
              :placeholder="$t('autest.settings.addMember')"
              option-filter-prop="label"
              class="member-add"
            />
            <Button
              type="primary"
              :disabled="addModuleMembers.length === 0"
              @click="assignModuleMembers"
            >
              {{ $t('autest.settings.assign') }}
            </Button>
          </div>

          <Input
            v-model:value="moduleMemberSearch"
            :placeholder="$t('autest.general.search')"
            allow-clear
            class="member-search mt-3"
          />

          <Table
            :columns="memberColumns"
            :data-source="moduleMembers"
            :row-key="accountRowKey"
            :pagination="{ pageSize: 10, hideOnSinglePage: true }"
            size="small"
            class="mt-2"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'roles'">
                <Tag
                  v-for="role in record.roles"
                  :key="role"
                  :color="role === 'admin' ? 'purple' : 'default'"
                >
                  {{ role }}
                </Tag>
              </template>
              <template v-else-if="column.key === 'actions'">
                <Button
                  danger
                  size="small"
                  @click="unassignModuleMember(record.username)"
                >
                  {{ $t('autest.general.remove') }}
                </Button>
              </template>
            </template>
          </Table>
        </template>
        <p v-else class="muted text-xs">
          {{ $t('autest.settings.selectModuleHint') }}
        </p>
      </Card>
    </template>
  </Page>
</template>

<style scoped>
.mb-3 {
  margin-bottom: 12px;
}
.mb-4 {
  margin-bottom: 16px;
}
.mt-2 {
  margin-top: 8px;
}
.mt-3 {
  margin-top: 12px;
}
.ml-2 {
  margin-left: 8px;
}
.text-xs {
  font-size: 12px;
}
.muted {
  color: hsl(var(--foreground) / 0.6);
}
.folder-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
.folder-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}
.folder-name {
  font-weight: 600;
}
.folder-path {
  font-family: monospace;
  font-size: 12px;
  color: hsl(var(--foreground) / 0.6);
}
.folder-path.connected {
  color: hsl(var(--primary));
}
.add-row {
  display: flex;
  gap: 8px;
  max-width: 520px;
  margin-bottom: 12px;
}
.user-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr) auto;
  gap: 12px;
  align-items: end;
}
.project-select {
  max-width: 320px;
  width: 100%;
}
.member-add {
  flex: 1;
}
.member-search {
  max-width: 320px;
}
@media (max-width: 768px) {
  .folder-grid,
  .user-grid {
    grid-template-columns: 1fr;
  }
}
</style>
