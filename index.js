const express = require('express')
const expressGraphQL = require('express-graphql')
const { GraphQLSchema } = require ('graphql')
const api = express()
const PORT = 4000
const getInstallBannersResponse = require('./getInstallBanners')
const { createPool } = require('mysql')
const cors = require('cors');

require('dotenv').config()
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const pool = createPool({
  host:process.env.DB_HOST,
  user:process.env.DB_USERNAME,
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME
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
  trendingItems: [TrendingItem]
    cmsPage (
        id: Int,identifier: String
    ): CmsPage
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

type CmsPage {
  identifier: String 
  url_key: String 
  title: String 
  content: String 
  content_heading: String 
  page_layout: String 
  meta_title: String 
  meta_description: String 
  meta_keywords: String 
  breadcrumb: cmsBreadcrumb 
  videoIds:[String!]
  trails : [TrailItems] 
  trends : [TrendItems] 
}
type TrendItems {
  tag: String
  data: [TrendData]
}
type TrendData {
  content: [ContentData]
  categoryId: String
  categoryName: String
}
type ContentData {
  type: String,
  url: String,
  durationMs: String,
  coverImage: String,
  title: String,
  id: String,
  userId: String,
  userName: String,
  userAvatar: String,
  userFollowers: String
}
type cmsBreadcrumb {
  page_name: String 
  page_url_key: String 
  page_url_path: String
}
type TrailItems {
  tag: String
  data: [Trail]
}
type Trail {
  trailId: String
  videoUrl: String
  durationMs: String
  coverImage: String
  title: String
  username: String
  userAvatar: String
  followerCount: String
  createdAt: String
  updatedAt: String
}
type TrendingItem {
  name: String
  image_link: String
  priority: Int
  url: String
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
   },

   trendingItems: () => {
    return [
        {
            "image_link": "https://shop.trell.co/media/Zoom_Star_Logo.png",
            "name": "Zoom Star",
            "priority": 1,
            "url": "/brands/zoom-star/c/78837",
            "__typename": "TrendingItem"
        },
        {
            "image_link": "https://shop.trell.co/media/Mr._Wonkers_Logo.png",
            "name": "Mr. Wonker",
            "priority": 2,
            "url": "/brands/mr-wonker/c/79314",
            "__typename": "TrendingItem"
        },
        {
            "image_link": "https://shop.trell.co/media/Bewakoof_1.png",
            "name": "Bewakoof",
            "priority": 3,
            "url": "/brands/bewakoof/c/3336",
            "__typename": "TrendingItem"
        },
        {
            "image_link": null,
            "name": "",
            "priority": 4,
            "url": null,
            "__typename": "TrendingItem"
        },
        {
            "image_link": null,
            "name": "",
            "priority": 5,
            "url": null,
            "__typename": "TrendingItem"
        },
        {
            "image_link": "https://shop.trell.co/media/Gosriki.png",
            "name": "Gosriki",
            "priority": 6,
            "url": "/brands/gosriki/c/5891",
            "__typename": "TrendingItem"
        },
        {
            "image_link": "https://shop.trell.co/media/Pepe_Jeans_2.png",
            "name": "Pepe Jeans London",
            "priority": 7,
            "url": "/brands/pepe-jeans-london/c/5523",
            "__typename": "TrendingItem"
        },
        {
            "image_link": "https://shop.trell.co/media/Jack_Jones.png",
            "name": "JACK & JONES",
            "priority": 8,
            "url": "/brands/jack-jones/c/4954",
            "__typename": "TrendingItem"
        },
        {
            "image_link": "https://shop.trell.co/media/Screenshot_2022-08-08_at_4.20.20_PM.png",
            "name": "T Shirts",
            "priority": 9,
            "url": "/global/tshirt/c/80145",
            "__typename": "TrendingItem"
        }
    ];
},
cmsPage: (id, identifier) => {
    return {
        "meta_description": "Shopping like never before! Get the Branded collection of Clothing, Accessories, Makeup, Health care, and lifestyle products for men and women. Free Shipping, Cash on delivery available on eligible purchase.",
        "meta_title": "Online Shopping Site - Shop Men & Women Fashion & Lifestyle Products Online in India - TrellShop",
        "videoIds": [
            "9784832",
            "9860271",
            "9835548"
        ],
        "trends": [
            {
                "tag": "valentines_trend1",
                "data": [
                    {
                        "categoryId": "951",
                        "categoryName": "Lipsticks for Valentine's",
                        "content": [
                            {
                                "coverImage": "https://cdn.trell.co/w=320,h=320/user-images/fetch/https://cdn.trell.co/w=320,h=320,fit=scale-down/user-images/images/orig/r1pkkTQmZh7UkHNhbdmapXHh1ECawWfQ.jpg",
                                "title": "Title1",
                                "id": "9784832",
                                "url": "https://cdn2.trell.co/videos/orig/414d7dfecb707697a89efb115cd45f55.mp4",
                                "userAvatar": "https://cdn.trell.co/w=60,h=60/user-images/fetch/https://cdn-gcp.trell.co/avatar/acdc711cbe3b4cb09374099ab2b4ff99.jpg",
                                "userFollowers": "646372",
                                "userName": "Aradhana_Acharya",
                                "type": "video",
                                "durationMs": "110000",
                                "__typename": "ContentData"
                            },
                            {
                                "coverImage": null,
                                "title": null,
                                "id": null,
                                "url": "https://picsum.photos/640/640",
                                "userAvatar": null,
                                "userFollowers": null,
                                "userName": null,
                                "type": "image",
                                "durationMs": null,
                                "__typename": "ContentData"
                            },
                            {
                                "coverImage": null,
                                "title": null,
                                "id": null,
                                "url": "https://picsum.photos/640/640",
                                "userAvatar": null,
                                "userFollowers": null,
                                "userName": null,
                                "type": "image",
                                "durationMs": null,
                                "__typename": "ContentData"
                            }
                        ],
                        "__typename": "TrendData"
                    },
                    {
                        "categoryId": "3384",
                        "categoryName": "Ace The Natural Makeup Look",
                        "content": [
                            {
                                "coverImage": "https://cdn.trell.co/w=320,h=320/user-images/fetch/https://cdn.trell.co/w=320,h=320,fit=scale-down/user-images/images/orig/f8RoUBTYm1Idrpb5GFDxdory7TxRhdei.",
                                "title": "Title2",
                                "id": "9860271",
                                "url": "https://cdn2.trell.co/videos/orig/80401b96362db84cec5e3656581cd737.mp4",
                                "userAvatar": "https://cdn.trell.co/w=60,h=60/user-images/fetch/https://cdn.trell.co/w=60,h=60,fit=smart/user-images/avatar/f3L6CvWMyK0wuk4qNBiEhnas4DW5cUgT.jpg",
                                "userFollowers": "47178",
                                "userName": "drunkencaptain_",
                                "type": "video",
                                "durationMs": "68000",
                                "__typename": "ContentData"
                            },
                            {
                                "coverImage": null,
                                "title": null,
                                "id": null,
                                "url": "https://picsum.photos/640/640",
                                "userAvatar": null,
                                "userFollowers": null,
                                "userName": null,
                                "type": "image",
                                "durationMs": null,
                                "__typename": "ContentData"
                            },
                            {
                                "coverImage": null,
                                "title": null,
                                "id": null,
                                "url": "https://picsum.photos/640/640",
                                "userAvatar": null,
                                "userFollowers": null,
                                "userName": null,
                                "type": "image",
                                "durationMs": null,
                                "__typename": "ContentData"
                            }
                        ],
                        "__typename": "TrendData"
                    },
                    {
                        "categoryId": "3336",
                        "categoryName": "Lipsticks & Glosses for every occasion",
                        "content": [
                            {
                                "coverImage": "https://cdn.trell.co/w=320,h=320/user-images/fetch/https://cdn.trell.co/w=320,h=320,fit=scale-down/user-images/images/orig/JmhCnM42uqqJi3iGv4J7eK7hw1npW8Sx.jpeg",
                                "title": "Title3",
                                "id": "9835548",
                                "url": "https://cdn2.trell.co/videos/orig/7DFG0gHcOBnqkge2haapAsbFIdWLsEBl.mp4",
                                "userAvatar": "https://cdn.trell.co/w=60,h=60/user-images/fetch/https://cdn-gcp.trell.co/avatar/37c0239c96394768adeb3330efd138ad.jpg",
                                "userFollowers": "776434",
                                "userName": "Bhawnalunthi",
                                "type": "video",
                                "durationMs": "63000",
                                "__typename": "ContentData"
                            },
                            {
                                "coverImage": null,
                                "title": null,
                                "id": null,
                                "url": "https://picsum.photos/640/640",
                                "userAvatar": null,
                                "userFollowers": null,
                                "userName": null,
                                "type": "image",
                                "durationMs": null,
                                "__typename": "ContentData"
                            },
                            {
                                "coverImage": null,
                                "title": null,
                                "id": null,
                                "url": "https://picsum.photos/640/640",
                                "userAvatar": null,
                                "userFollowers": null,
                                "userName": null,
                                "type": "image",
                                "durationMs": null,
                                "__typename": "ContentData"
                            }
                        ],
                        "__typename": "TrendData"
                    }
                ],
                "__typename": "TrendItems"
            }
        ],
        "__typename": "CmsPage"
    }
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


api.use(cors({credentials: true, origin: true}));
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