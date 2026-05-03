/* enforce: post — после восстановления Pinia из SSR-пэйлоада, иначе token из LS может затереться пустым состоянием */
export default defineNuxtPlugin({
  name: "auth-init",
  enforce: "post",
  setup() {
    useAuthStore().load();
  }
});
