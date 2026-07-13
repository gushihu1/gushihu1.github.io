<script setup lang="ts">defineProps<{ error: { statusCode: number; statusMessage: string } }>()</script>
<template><div class="error-page"><span>ERROR</span><h1>{{ error.statusCode }}</h1><p>{{ error.statusMessage || '页面似乎漂移到了未知空间。' }}</p><button class="button primary" @click="clearError({ redirect: '/' })">返回首页</button></div></template>
