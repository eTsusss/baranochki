/* enforce: post — после pinia-пэйлоада; app:mounted — после полной гидрации Vue */
export default defineNuxtPlugin({
  name: "auth-init",
  enforce: "post",
  setup(nuxtApp) {
    const auth = useAuthStore();
    const sync = () => auth.load();
    sync();
    nuxtApp.hook("app:mounted", sync);
  }
});
