const express = require('express')
const expressGraphQL = require('express-graphql')
const { GraphQLSchema } = require ('graphql')
const api = express()
const PORT = 4000
const getInstallBannersResponse = require('./getInstallBanners')
const { createPool } = require('mysql')

const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const pool = createPool({
  host:"localhost",
  user:"admin",
  password:"root",
  database:"trell_shop_db"
})

const configMap = {}; 

pool.query('Select * from core_config_data where scope ="default"', (err, result, fields)=> {
  if(err) {
    return console.log(err);
  }
  else{
    result=JSON.parse(JSON.stringify(result))
    for(var i of result)
    {
      configMap[i.path] = i.value;
    }
  } 
})

var installBannerImageLinks = [];

pool.query('Select * from trell_installbanner_entity', (err, result, fields) =>{
  if(err){
    return console.log(err);
  }
  else {
    result=JSON.parse(JSON.stringify(result))
      result.forEach(element => {
        installBannerImageLinks.push({'image_link': element.image_link });
      });
  }
})


// Define the GraphQL schema
const schema = buildSchema(`
type Query {
  clientConfig: ClientConfig
  banners: [BannerItem]
}
type ClientConfig {
    global: GlobalClientConfig
    payment: PaymentClientConfig
}

type GlobalClientConfig {
    top_msg : String
    shipping_flat_rate : String
    free_ship_offer : String
    cart_event : String
    cart_event_offer : String
    cart_prepaid_conflict_message: String
    max_sale_qty : Int
    offer_count_visible: Int
    enable_adobe_sensi: Boolean
    enable_gst_input: Boolean
    gst_order_amount: Int
    enable_customer_also_bought: Boolean
    search_product_suggestion_count: Int
    autocomplete_query_version : Int
    free_delivery_nudge_enable: Int
    order_return_feature_enable: Int
    best_price_flag: Int
    otp_visible_channels: [String]
    web_auto_detect_otp: Boolean
    configurable_products_custom_cta: Boolean
    is_reward_visible: Boolean
    use_reward_point: Boolean
    maximum_usage_for_single_checkout: Float
    allow_account_merging: Boolean
    allow_reward_visibility_on_pdp: Boolean
    min_cart_total_for_reward_points: Float
    percent_cart_limit_reward_points: Float
    enable_live_stream: Boolean
    product_query_version: Int
    catalog_query_version: Int
    category_meta_query_version: Int
    maximum_cod_limit : Float
    product_search_query_version: Int
    store_recently_viewed_items : Boolean
    edd_flag : Boolean
    failed_orders_flag : Int
    plp_ssr_enabled: Int
    best_price_on_plp: Int
    wishlist_popup_config : WishlistPopupConfig
    coupon_application_flag: Int
    total_refund_visibility: Int
    refund_visibility_rto: Int
    refund_visibility_cancel: Int
    refund_visibility_return: Int
    image_aspect_ratio: Int
    token_expiry_flag: Boolean
    order_confirmation_referral_image_flag: Boolean
    category_for_lipshade_selection:[String!]
    first_login_reward_points: Float
    plp_ads_starting_position: Int
    plp_ads_offset_value: Int
}

type WishlistPopupConfig {
    wishlist_banner_img: String
    wishlist_popup_text: String
    wishlist_popup_img: String
    wishlist_banner_link: String
}

type PaymentClientConfig {
    razorpay : RazorpayClientConfig
}

type RazorpayClientConfig {
    api_key : String
    merchant_name : String
}


type BannerItem {
  image_link: String
}
`);


// Define the root resolver function
const root = {
  clientConfig: () => { return {
    global: {
      free_ship_offer: configMap['trell_client_config/trell_client_global_config/free_ship_offer'],
      top_msg: configMap['trell_client_config/trell_client_global_config/client_top_msg'],
      shipping_flat_rate: configMap['carriers/flatrate/price'],
      max_sale_qty: configMap['cataloginventory/item_options/max_sale_qty'],
      offer_count_visible: configMap['offer/general/trell_offer_showcount'],
      search_product_suggestion_count: getSearchProductSuggestionCount(),
      cart_prepaid_conflict_message: configMap['trell_client_config/trell_client_global_config/cart_prepaid_conflict_message'],
         cart_event: configMap['trell_client_config/trell_client_global_config/cart_event'],
        cart_event_offer: configMap['trell_client_config/trell_client_global_config/cart_event_offer'],
        enable_adobe_sensi: !!Number(configMap['trell_client_config/trell_client_global_config/enable_adobe_sensi']),
        is_reward_visible: !!Number(configMap['trell_reward_config/settings/is_reward_visible']),
        free_delivery_nudge_enable: getFreeDeliveryNudgeValue(),
        otp_visible_channels: getOtpChannels(),
        use_reward_point: !!Number(configMap['trell_reward_config/settings/use_reward_point']),
        maximum_usage_for_single_checkout: configMap['trell_reward_config/settings/maximum_usage_for_single_checkout'],
        allow_account_merging: !!Number(configMap['trell_reward_config/account_merging/allow_account_merging']),
        order_return_feature_enable: getOrderReturnFlagValue(),
        coupon_application_flag: configMap['trell_client_config/trell_client_global_config/coupon_application_flag'],
        order_confirmation_referral_image_flag: !!Number(configMap['trell_client_config/trell_client_global_config/order_confirmation_referral_image_flag']),
        best_price_flag: configMap['trell_client_config/trell_client_global_config/best_price_flag'],
        maximum_cod_limit: configMap['payment/cashondelivery/max_order_total'],
        gst_order_amount: configMap['trell_client_config/trell_client_global_config/gst_order_amount'],
        enable_gst_input: !!Number(configMap['trell_client_config/trell_client_global_config/enable_gst_input']),
        enable_customer_also_bought: !!Number(configMap['trell_customer_also_bought_config/settings/enable_customer_also_bought']),
        configurable_products_custom_cta: !!Number(configMap['trell_client_config/trell_client_global_config/enable_configurable_products_custom_cta']),
        product_query_version: configMap['trell_client_config/trell_client_global_config/product_query_version'],
        catalog_query_version: configMap['trell_client_config/trell_client_global_config/catalog_query_version'],
        product_search_query_version: configMap['trell_client_config/trell_client_global_config/product_search_query_version'],
        web_auto_detect_otp: !!Number(configMap['trell_client_config/trell_client_global_config/enable_web_auto_detect_otp']),
        wishlist_popup_config: {
          wishlist_banner_img: configMap['trell_client_config/trell_client_global_config/wishlist_banner_img'],
          wishlist_popup_text: configMap['trell_client_config/trell_client_global_config/wishlist_popup_text'],
          wishlist_popup_img: configMap['trell_client_config/trell_client_global_config/wishlist_popup_img'],
          wishlist_banner_link: configMap['trell_client_config/trell_client_global_config/wishlist_banner_link'],
        },
        plp_ssr_enabled: configMap['web/ssr/plp_ssr_enabled'],
        refund_visibility_rto: configMap['feature_flag/refund_visibility/rto'],
        refund_visibility_cancel: configMap['feature_flag/refund_visibility/cancel'],
        refund_visibility_return: configMap['feature_flag/refund_visibility/return'],
        edd_flag: !!Number(configMap['feature_flag/edd/edd_flag']),
        total_refund_visibility: configMap['feature_flag/refund_visibility/total_refund_visibility'],
        failed_orders_flag: configMap['feature_flag/failed_orders/failed_orders_flag'],
        percent_cart_limit_reward_points: configMap['trell_reward_config/settings/percent_limit_trell_cash'],
        first_login_reward_points: configMap['trell_client_config/trell_client_global_config/first_login_reward_points'],
    },
    payment: {
      razorpay: {
        api_key: configMap['payment/razorpay/key_id'],
        merchant_name: configMap['payment/razorpay/merchant_name_override']
      }
    }
  }
},

  banners: () => { 
    return installBannerImageLinks
   }
};

function getFreeDeliveryNudgeValue()
{
  return Number(configMap['feature_flag/order_delivery_nudge/order_delivery_nudge_flag']);
}

function getOrderReturnFlagValue()
{
  return Number(configMap['feature_flag/order_return_feature/order_return_feature_flag']);
}

function getOtpChannels() 
{
  const channels = configMap['trell_client_config/trell_client_global_config/client_visible_otp_channels'];
  
  if (channels) {
    return channels.split(',').map(channel => channel.trim());
  } 
  return ['sms'];
}

function getSearchProductSuggestionCount()
{
  return Number(configMap['trell_client_config/trell_client_global_config/search_product_suggestions']);
}

// Set up the /graphql endpoint with express-graphql
api.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}));

api.get('/', (req, res)=> {
    res.send("Welcome")
})

api.get('/getNavivationREST', (req,res)=> {
    res.status(200).json(clientConfigResponse)
})
api.listen(PORT)