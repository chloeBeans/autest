<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/store/auth';
import { useProjectStore } from '@/store/projects';
import { useUserStore } from '@/store/users';
import { useFolderStore } from '@/store/folders';
import { useUiStore } from '@/store/ui';
import { useToastStore } from '@/store/toast';
import { useFileSystemSupport } from '@/composables/useFileSystemSupport';
import { pickDirectory } from '@/utils/fileSystem';
import { isMock } from '@/api';
import { PORTALS } from '@/utils/constants';

const auth = useAuthStore();
const projectStore = useProjectStore();
const userStore = useUserStore();
const folderStore = useFolderStore();
const ui = useUiStore();
const toast = useToastStore();
const { locale } = useI18n();
const { supported } = useFileSystemSupport();

const { currentProject } = storeToRefs(projectStore);

const portals = [
  { value: PORTALS.EXTERNAL, label: 'general.external', icon: 'mdi-web' },
  { value: PORTALS.INTERNAL, label: 'general.internal', icon: 'mdi-shield-lock-outline' },
];

async function connect(portal) {
  try {
    const handle = await pickDirectory();
    folderStore.setHandle(portal, handle);
    toast.success(`${handle.name} ${$t('folders.connected').toLowerCase()}`);
  } catch (err) {
    if (err?.name !== 'AbortError') toast.error(err.message);
  }
}

function setLang(lang) {
  locale.value = lang;
  ui.setLang(lang);
}

// --- Admin: projects ---
const newProjectName = ref('');
function addProject() {
  try {
    projectStore.addProject(newProjectName.value);
    toast.success('Project added');
    newProjectName.value = '';
  } catch (err) {
    toast.error(err.message);
  }
}

// --- Admin: users ---
const newUser = ref({ username: '', password: '', name: '', role: 'user' });
const roleItems = [
  { title: 'User', value: 'user' },
  { title: 'Admin', value: 'admin' },
];
function addUser() {
  try {
    userStore.addUser({ ...newUser.value });
    toast.success('User added');
    newUser.value = { username: '', password: '', name: '', role: 'user' };
  } catch (err) {
    toast.error(err.message);
  }
}

// --- Admin: membership (built to scale to hundreds of members) ---
const membershipProjectId = ref(projectStore.currentProjectId);
const membershipProject = computed(() =>
  projectStore.projects.find(p => p.id === membershipProjectId.value)
);

const userMap = computed(() => Object.fromEntries(userStore.users.map(u => [u.username, u])));

const memberCount = computed(() => membershipProject.value?.members?.length || 0);

// Members resolved to user objects, filtered by the search box.
const memberSearch = ref('');
const members = computed(() => {
  const list = (membershipProject.value?.members || []).map(
    username => userMap.value[username] || { username, name: username, role: 'user' }
  );
  const q = memberSearch.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(
    u => u.username.toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q)
  );
});

// Non-members as searchable options for the multi-add autocomplete.
const nonMemberItems = computed(() => {
  const memberSet = new Set(membershipProject.value?.members || []);
  return userStore.users
    .filter(u => !memberSet.has(u.username))
    .map(u => ({ title: `${u.name} (${u.username})`, value: u.username }));
});

const addMemberUsers = ref([]);
function assignSelected() {
  if (!addMemberUsers.value.length) return;
  const count = addMemberUsers.value.length;
  addMemberUsers.value.forEach(username =>
    projectStore.assignUser(membershipProjectId.value, username)
  );
  toast.success(`Added ${count} member${count > 1 ? 's' : ''}`);
  addMemberUsers.value = [];
}
function unassign(username) {
  projectStore.unassignUser(membershipProjectId.value, username);
}

const projectItems = computed(() =>
  projectStore.projects.map(p => ({ title: p.name, value: p.id }))
);
</script>

<template>
  <div>
    <PageHeader :title="$t('settings.title')" icon="mdi-cog-outline" />

    <!-- Portal folders (current project) -->
    <Card>
      <template #header>
        {{ $t('folders.title') }}
        <span v-if="currentProject" class="text-caption text-medium-emphasis ml-2">
          — {{ currentProject.name }}
        </span>
      </template>

      <v-alert v-if="!supported" type="warning" variant="tonal" density="compact" class="mb-3">
        {{ $t('folders.unsupported') }}
      </v-alert>
      <p class="text-body-2 text-medium-emphasis mb-3">{{ $t('folders.info') }}</p>

      <v-row>
        <v-col v-for="p in portals" :key="p.value" cols="12" md="6">
          <div class="d-flex align-center justify-space-between pa-3 folder-row">
            <div class="d-flex align-center ga-2">
              <v-icon :icon="p.icon" color="primary" />
              <div>
                <div class="font-weight-medium">{{ $t(p.label) }}</div>
                <div
                  class="text-caption mono"
                  :class="
                    folderStore.isConnected(p.value) ? 'text-primary' : 'text-medium-emphasis'
                  "
                >
                  {{
                    folderStore.isConnected(p.value)
                      ? `${folderStore.names[p.value]}/tests/`
                      : $t('folders.notConnected')
                  }}
                </div>
              </div>
            </div>
            <FormButton
              size="md"
              :disabled="!supported"
              :variant="folderStore.isConnected(p.value) ? 'line-secondary' : 'line-primary'"
              :prependIcon="
                folderStore.isConnected(p.value) ? 'mdi-refresh' : 'mdi-folder-plus-outline'
              "
              @click="connect(p.value)"
            >
              {{
                folderStore.isConnected(p.value) ? $t('folders.reconnect') : $t('folders.connect')
              }}
            </FormButton>
          </div>
        </v-col>
      </v-row>
      <div class="text-caption text-medium-emphasis mt-2">
        Browsers expose only the connected folder name (not the full disk path); generated specs are
        written to <span class="mono">&lt;folder&gt;/tests/</span>.
      </div>
    </Card>

    <!-- Preferences -->
    <Card>
      <template #header>{{ $t('settings.preferences') }}</template>
      <div class="d-flex align-center justify-space-between">
        <span>{{ $t('settings.language') }}</span>
        <v-btn-toggle :model-value="locale" density="comfortable" mandatory>
          <v-btn value="en" size="small" @click="setLang('en')">EN</v-btn>
          <v-btn value="bm" size="small" @click="setLang('bm')">BM</v-btn>
        </v-btn-toggle>
      </div>
      <v-divider class="my-3" />
      <div class="d-flex align-center justify-space-between">
        <span>{{ $t('settings.backend') }}</span>
        <Badge :variant="isMock ? 'yellow' : 'green'">{{ isMock ? 'Mock' : 'Live /api' }}</Badge>
      </div>
    </Card>

    <!-- Admin area -->
    <template v-if="auth.isAdmin">
      <Card>
        <template #header>
          <v-icon icon="mdi-shield-crown-outline" color="secondary" class="mr-2" />
          {{ $t('settings.projects') }}
        </template>
        <div class="d-flex ga-2 mb-3" style="max-width: 480px">
          <v-text-field
            v-model="newProjectName"
            :label="$t('settings.newProject')"
            hide-details
            density="comfortable"
          />
          <FormButton prependIcon="mdi-plus" @click="addProject">{{
            $t('general.save')
          }}</FormButton>
        </div>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>{{ $t('settings.project') }}</th>
              <th>{{ $t('settings.members') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in projectStore.projects" :key="p.id">
              <td>{{ p.name }}</td>
              <td>{{ p.members.length }}</td>
            </tr>
          </tbody>
        </v-table>
      </Card>

      <Card>
        <template #header>
          <v-icon icon="mdi-account-multiple-outline" color="secondary" class="mr-2" />
          {{ $t('settings.users') }}
        </template>
        <v-row dense class="mb-2">
          <v-col cols="12" md="3"
            ><v-text-field v-model="newUser.username" :label="$t('auth.username')" hide-details
          /></v-col>
          <v-col cols="12" md="3"
            ><v-text-field v-model="newUser.password" :label="$t('auth.password')" hide-details
          /></v-col>
          <v-col cols="12" md="3"
            ><v-text-field v-model="newUser.name" label="Name" hide-details
          /></v-col>
          <v-col cols="6" md="2"
            ><v-select v-model="newUser.role" :items="roleItems" label="Role" hide-details
          /></v-col>
          <v-col cols="6" md="1" class="d-flex align-center">
            <FormButton prependIcon="mdi-plus" @click="addUser" />
          </v-col>
        </v-row>
        <v-table density="comfortable">
          <thead>
            <tr>
              <th>{{ $t('auth.username') }}</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in userStore.publicList" :key="u.username">
              <td class="mono">{{ u.username }}</td>
              <td>{{ u.name }}</td>
              <td>
                <Badge :variant="u.role === 'admin' ? 'purple' : 'grey'">{{ u.role }}</Badge>
              </td>
            </tr>
          </tbody>
        </v-table>
      </Card>

      <Card>
        <template #header>
          <div class="d-flex align-center justify-space-between" style="width: 100%">
            <span>
              <v-icon icon="mdi-account-switch-outline" color="secondary" class="mr-2" />
              {{ $t('settings.membership') }}
            </span>
            <Badge variant="blue">{{ memberCount }} members</Badge>
          </div>
        </template>

        <v-row dense class="mb-1">
          <v-col cols="12" md="5">
            <v-autocomplete
              v-model="membershipProjectId"
              :items="projectItems"
              :label="$t('settings.project')"
              hide-details
              density="comfortable"
            />
          </v-col>
        </v-row>

        <!-- Add members: searchable, multi-select -->
        <div class="d-flex ga-2 mb-3 align-start flex-wrap">
          <v-autocomplete
            v-model="addMemberUsers"
            :items="nonMemberItems"
            :label="$t('settings.addMember')"
            multiple
            chips
            closable-chips
            hide-details
            density="comfortable"
            style="min-width: 320px; flex: 1"
          />
          <FormButton
            prependIcon="mdi-account-plus-outline"
            :disabled="!addMemberUsers.length"
            @click="assignSelected"
          >
            {{ $t('settings.assign') }}
          </FormButton>
        </div>

        <!-- Search + virtualized member list (scales to hundreds) -->
        <v-text-field
          v-model="memberSearch"
          prepend-inner-icon="mdi-magnify"
          :label="$t('general.search')"
          density="comfortable"
          hide-details
          clearable
          class="mb-2"
          style="max-width: 320px"
        />

        <div v-if="!memberCount" class="text-medium-emphasis py-4">No members yet</div>
        <div v-else-if="!members.length" class="text-medium-emphasis py-4">No members match.</div>
        <v-virtual-scroll v-else :items="members" height="360" item-height="60" class="member-list">
          <template #default="{ item }">
            <div class="d-flex align-center justify-space-between member-row px-3">
              <div class="d-flex align-center ga-3">
                <v-avatar size="32" color="primary" variant="tonal">
                  <span class="text-caption">{{ (item.username[0] || '?').toUpperCase() }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.name }}</div>
                  <div class="text-caption mono text-medium-emphasis">{{ item.username }}</div>
                </div>
                <Badge :variant="item.role === 'admin' ? 'purple' : 'grey'">{{ item.role }}</Badge>
              </div>
              <v-btn
                icon="mdi-account-remove-outline"
                variant="text"
                color="error"
                size="small"
                @click="unassign(item.username)"
              />
            </div>
          </template>
        </v-virtual-scroll>
      </Card>
    </template>
  </div>
</template>

<style scoped>
.folder-row {
  border: 1px solid #e6e9f0;
  border-radius: 12px;
}
.member-list {
  border: 1px solid #e6e9f0;
  border-radius: 12px;
}
.member-row {
  height: 60px;
  border-bottom: 1px solid #f0f2f6;
}
</style>
