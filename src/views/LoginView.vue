<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { useProjectStore } from '@/store/projects';
import { useToastStore } from '@/store/toast';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const projectStore = useProjectStore();
const toast = useToastStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const isDev = import.meta.env.DEV;

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    auth.login(username.value.trim(), password.value);
    projectStore.ensureValidSelection();
    toast.success(`Welcome, ${auth.currentUser.name}`);
    router.push(route.query.redirect || '/');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function quickFill(user) {
  username.value = user;
  password.value = user;
}
</script>

<template>
  <v-main style="background: var(--app-bg)">
    <v-container class="fill-height" style="min-height: 100vh">
      <v-row justify="center" align="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <div class="text-center mb-6">
            <v-icon icon="mdi-robot-happy-outline" size="48" color="primary" />
            <h1 class="text-h5 font-weight-bold mt-2">{{ $t('app.name') }}</h1>
            <div class="text-body-2 text-medium-emphasis">{{ $t('app.tagline') }}</div>
          </div>

          <Card>
            <template #header>{{ $t('auth.signIn') }}</template>
            <v-form @submit.prevent="submit">
              <v-text-field
                v-model="username"
                :label="$t('auth.username')"
                prepend-inner-icon="mdi-account-outline"
                autofocus
                class="mb-3"
              />
              <v-text-field
                v-model="password"
                :label="$t('auth.password')"
                type="password"
                prepend-inner-icon="mdi-lock-outline"
                class="mb-2"
              />
              <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3">
                {{ error }}
              </v-alert>
              <FormButton
                block
                size="lg"
                :loading="loading"
                prependIcon="mdi-login"
                @click="submit"
              >
                {{ $t('auth.signIn') }}
              </FormButton>
            </v-form>

            <div v-if="isDev" class="mt-4 text-caption text-medium-emphasis">
              Demo logins (click to fill):
              <div class="d-flex flex-wrap ga-1 mt-1">
                <v-chip
                  v-for="u in ['admin', 'qa1', 'qa2', 'dev1']"
                  :key="u"
                  size="x-small"
                  class="cursor-pointer"
                  @click="quickFill(u)"
                >
                  {{ u }} / {{ u }}
                </v-chip>
              </div>
            </div>
          </Card>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>
