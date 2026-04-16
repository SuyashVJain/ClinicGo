package com.clinicgo.patient.network;

import android.content.Context;
import android.content.SharedPreferences;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.logging.HttpLoggingInterceptor;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

public class ApiClient {
    // IP Address of the backend server. Update this to match your development
    // environment.
    private static final String BASE_URL = "https://brantlee-vaned-cain.ngrok-free.dev/api/v1/";
    // Use 10.0.2.2 for Android emulator to reach localhost on your PC
    // Change to your PC's IP (e.g. 192.168.1.x) for physical device

    private static Retrofit retrofit = null;
    private static Context appContext;

    public static void init(Context context) {
        appContext = context.getApplicationContext();
    }

    public static Retrofit getClient() {
        if (retrofit == null) {
            HttpLoggingInterceptor logging = new HttpLoggingInterceptor();
            logging.setLevel(HttpLoggingInterceptor.Level.BODY);

            OkHttpClient client = new OkHttpClient.Builder()
                    .addInterceptor(logging)
                    .addInterceptor(chain -> {
                        Request original = chain.request();
                        SharedPreferences prefs = appContext.getSharedPreferences(
                                "clinicgo_prefs", Context.MODE_PRIVATE);
                        String token = prefs.getString("jwt_token", null);

                        Request.Builder builder = original.newBuilder()
                                .header("Content-Type", "application/json");

                        if (token != null) {
                            builder.header("Authorization", "Bearer " + token);
                            builder.header("ngrok-skip-browser-warning", "true");

                        }

                        return chain.proceed(builder.build());
                    })
                    .build();

            retrofit = new Retrofit.Builder()
                    .baseUrl(BASE_URL)
                    .client(client)
                    .addConverterFactory(GsonConverterFactory.create())
                    .build();
        }
        return retrofit;
    }

    public static ApiService getService() {
        return getClient().create(ApiService.class);
    }
}
