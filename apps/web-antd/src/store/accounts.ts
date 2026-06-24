import type { Account, PublicAccount } from '#/types/domain';

import { computed, ref } from 'vue';

import { defineStore } from 'pinia';

/**
 * Accounts — the client-side mock data layer for user accounts (persisted,
 * source of truth for login until a real backend exists). Seeded with one admin
 * and a few testers. Passwords are plain only because this is a local mock.
 */
export const useAccountStore = defineStore(
  'accounts',
  () => {
    const accounts = ref<Account[]>([
      {
        username: 'admin',
        password: 'admin',
        realName: 'Administrator',
        roles: ['admin'],
        homePath: '/',
      },
      { username: 'qa1', password: 'qa1', realName: 'QA One', roles: ['user'] },
      { username: 'qa2', password: 'qa2', realName: 'QA Two', roles: ['user'] },
      { username: 'dev1', password: 'dev1', realName: 'Dev One', roles: ['user'] },
    ]);

    const publicList = computed<PublicAccount[]>(() =>
      accounts.value.map(({ password: _password, ...rest }) => rest),
    );

    function getAccount(username: string): Account | undefined {
      return accounts.value.find((a) => a.username === username);
    }

    /** Returns the account on a valid username+password match, else null. */
    function validate(username: string, password: string): Account | null {
      return (
        accounts.value.find(
          (a) => a.username === username && a.password === password,
        ) ?? null
      );
    }

    function addAccount(input: {
      username: string;
      password?: string;
      realName?: string;
      roles?: string[];
    }) {
      const username = String(input.username || '').trim();
      if (!username) throw new Error('Username is required');
      if (accounts.value.some((a) => a.username === username)) {
        throw new Error('User already exists');
      }
      accounts.value.push({
        username,
        password: input.password || username,
        realName: input.realName || username,
        roles: input.roles ?? ['user'],
      });
    }

    return { accounts, publicList, getAccount, validate, addAccount };
  },
  { persist: { pick: ['accounts'] } },
);
