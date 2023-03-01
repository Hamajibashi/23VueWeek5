const baseUrl = 'https://vue3-course-api.hexschool.io';
const api_path = 'hmjbs';

const {defineRule, Form, Field, ErrorMessage, configure} = VeeValidate;
const {required, email, min, max, integer} = VeeValidateRules;
const {localize, loadLocaleFromURL} = VeeValidateI18n;

defineRule('required', required);
defineRule('email', email);
defineRule('min', min);
defineRule('max', max);
defineRule('integer', integer);

loadLocaleFromURL('./zh_TW.json');

configure({
  generateMessage: localize('zh_TW'),
});

const productModal = {
    // 當 id 變動時，取得遠端資料。並呈現 modal
    props: ['id', 'addToCart', 'openModal'],
    data() {
        return {
            modal: {},
            tempProduct: {},
            qty: 1,
        }
    },
    template: '#userProductModal',
    watch: {
        id() {
            if (this.id) {
                const url = `${baseUrl}/v2/api/${api_path}/product/${this.id}`
                axios.get(url)
                    .then(res => {
                        this.tempProduct = res.data.product;
                        this.modal.show();
                    })
            }
        }
    },
    methods: {
        hide() {
            this.modal.hide();
            this.qty = 1;
        }
    },
    mounted() {
        this.modal = new bootstrap.Modal(this.$refs.modal);
        // 監聽 DOM，當 Modal 關閉時做其他事情
        this.$refs.modal.addEventListener('hidden.bs.modal', (e) => {
            this.openModal('');
        })
    }
}

const app = Vue.createApp({
    components: {
        productModal,
        VForm:Form,
        VField:Field,
        ErrorMessage:ErrorMessage,
    },
    data() {
        return {
            products: [],
            productId: [],
            cart: {
                carts: []
            },
            loadingItem: '',
            form:{
                user:{
                    name:'',
                    email:'',
                    tel:'',
                    address:'',
                },
                message:'',
            }
        }
    },
    methods: {
        // loading 效果
        addLoading(){
            let loader = this.$loading.show();
            setTimeout(() => {
                loader.hide()
            }, 1000);
        },
        // 取得產品
        getProducts() {
            const url = `${baseUrl}/v2/api/${api_path}/products`
            axios.get(url)
                .then(res => {
                    this.products = res.data.products;
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        // 打開 modal
        openModal(id) {
            this.productId = id;
        },
        // 取得購物車
        getCart() {
            const url = `${baseUrl}/v2/api/${api_path}/cart`;
            axios.get(url)
                .then(res => {
                    this.cart = res.data.data;
                })
                .catch(err => {
                    alert(err.data.message);
                })

        },
        // 加入購物車
        addToCart(id, qty = 1) {
            const data = {
                product_id: id,
                qty
            }
            this.loadingItem = id;
            const url = `${baseUrl}/v2/api/${api_path}/cart`;
            axios.post(url, { data })
                .then(res => {
                    this.$refs.productModal.hide();
                    alert(res.data.message);
                    this.getCart();
                    this.loadingItem = '';
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        // 扁更產品數量
        updateItem(item) {
            const data = {
                product_id: item.id,
                qty: item.qty
            };
            this.loadingItem = item.id;
            const url = `${baseUrl}/v2/api/${api_path}/cart/${item.id}`;
            axios.put(url, { data })
                .then(res => {
                    alert(res.data.message);
                    this.getCart();
                    this.loadingItem = '';
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        // 刪除全部購物車
        removeAll() {
            const url = `${baseUrl}/v2/api/${api_path}/carts`;
            axios.delete(url)
                .then(res => {
                    alert(res.data.message);
                    this.getCart();
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        // 刪除單一產品
        removeItem(id) {
            this.loadingItem = id;
            const url = `${baseUrl}/v2/api/${api_path}/cart/${id}`;
            axios.delete(url)
                .then(res => {
                    alert(res.data.message);
                    this.getCart();
                    this.loadingItem = '';
                })
                .catch(err => {
                    alert(err.data.message);
                })
        },
        // 送出訂單
        createOrder(){
            const data = this.form;
            const url = `${baseUrl}/v2/api/${api_path}/order`;
            axios.post(url,{data})
            .then(res=>{
                alert(res.data.message);
                this.$refs.form.resetForm();
                this.getCart();
            })
            .catch(err=>{
                alert(err.data.message);
            })
        }
    },
    mounted() {
        this.addLoading();
        this.getProducts();
        this.getCart();
    }
});

app.use(VueLoading.LoadingPlugin);

app.mount('#app');
