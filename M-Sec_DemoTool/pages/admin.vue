<template>
  <div>
    <h2>Admin</h2>
    <p>バスの運転手や管理者が見る画像</p>
    <img v-bind:src="'data:image/jpeg;base64,' + resp.slice(0, -4)" />
  </div>
</template>
<script>
export default {
  async asyncData({ $axios }) {
    // 取得先のURL
    const url = "http://localhost:1880/admin";
    // リクエスト（Get）
    const response = await $axios.$get(url);
    // 配列で返ってくるのでJSONにして返却
    return {
      resp: response
    };
  }
};
</script>
