const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
require("@babel/polyfill");

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const optimtzation = () => {
    const configObj = {
        splitChunks: {
            chunks: 'all',
        }
    };
    if(isProd) {
        configObj.minimizer = [
            new CssMinimizerPlugin(),
            new TerserPlugin(),
        ]
    }
    return configObj;
}

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: ["@babel/polyfill", './js/main.js'],
    output: {
        filename: `./assets/js/${filename('js')}`,
        path: path.resolve(__dirname, 'dist'),
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        historyApiFallback: true,
        open: true,
        hot: true,
        compress: true,
        port: 5000,
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
            filename: 'index.html',
            minify: {
                collapseWhitespace: isProd,
            }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
            filename: `./assets/css/${filename('css')}`,
        }),
    ],
    devtool: isProd ? false : 'source-map' ,
    optimization: optimtzation(),
    module: {
        rules: [
            {
                test: /\.html$/,
                use: 'html-loader',
            },
            {
                test: /\.css$/i,
                use: [
                {
                    loader: MiniCssExtractPlugin.loader,
                        options: {
                            hmr: isDev,
                        }
                },
                'css-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                }
            },
            {
                test: /\.s[ac]ss$/,
                use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader'],
            },
            {
                test: /\.(?:|gif|png|svg|jpg|jpeg)$/,
                type: 'asset/resource',
                generator : {
                    filename : 'assets/img/[name][ext][query]',
                }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/i,
                type: 'asset/resource',
                generator : {
                    filename : 'assets/fonts/[name][ext][query]',
                }
            },
        ]
    }
}
