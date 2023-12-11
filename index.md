# 統計筆記



### 描述性統計：

- box plot
  - 平均數
  - 中位數
  - 四分位數
- histogram
  - k
  - s
  - 標準差
  - (是否常態分布)
  - 資料量

### 視覺化：

boxplot：boxplot(資料$欄位,第二筆資料$欄位, main="Boxplot of RMbnd", ylab="欄位")

histogram：hist(資料$欄位, main="Histogram of RMbnd", xlab="欄位", breaks=10)

scatter plot：plot(資料$欄位, 資料$欄位, main="Scatter Plot", xlab="RMbnd", ylab="pre_bnd")



### 基本操作：

讀檔案：RM=read.csv(file.choose(), header=TRUE)

安裝套件：install.packages("packageName")

使用套件：library(packageName)

描述性統計：describe(資料$欄位)

相關係數：correlation_coefficient <- cor(RM$RMbnd, RM$pre_bnd)



單樣本T檢定：t_test_result <- t.test(RM$RMbnd, mu = 6)

​	=>H0是平均值=6，因此如果p-value<0.05，那麼就拒絕H0

T檢定步驟：

1. 設定H0,H1
2. 執行：t_test_result <- t.test(資料A$欄位, 資料B$欄位, var.equal = TRUE)





### 套件：

描述性統計：

install.packages("psych")
library(psych)



