import React, { useEffect, useRef, useState } from "react";
import { loadPaymentWidget, ANONYMOUS } from "@tosspayments/payment-widget-sdk";
import { nanoid } from "nanoid";
import "../../../styles/App.css";

const selector = "#payment-widget";

const widgetClientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

export function CheckoutPage({ orderCode, orderName, amount: initialAmount, onNavigate }) {
  const [paymentWidget, setPaymentWidget] = useState(null);
  const paymentMethodsWidgetRef = useRef(null);
  const [price, setPrice] = useState(initialAmount || 50_000);
  const customerKey = React.useMemo(() => nanoid(), []);

  useEffect(() => {
    const fetchPaymentWidget = async () => {
      try {
        const loadedWidget = await loadPaymentWidget(
          widgetClientKey,
          customerKey
        );
        setPaymentWidget(loadedWidget);
      } catch (error) {
        console.error("Error fetching payment widget:", error);
      }
    };

    fetchPaymentWidget();
  }, []);

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      selector,
      { value: price },
      { variantKey: "DEFAULT" }
    );

    paymentWidget.renderAgreement("#agreement", { variantKey: "AGREEMENT" });

    paymentMethodsWidgetRef.current = paymentMethodsWidget;
  }, [paymentWidget, price]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef.current;

    if (paymentMethodsWidget == null) {
      return;
    }

    paymentMethodsWidget.updateAmount(price);
  }, [price]);

  const handlePaymentRequest = async () => {
    // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
    // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
    if (!orderCode) {
      console.error("주문 코드가 없습니다.");
      return;
    }

    try {
      // Next.js App Router 경로 사용
      const successUrl = typeof window !== 'undefined' 
        ? `${window.location.origin}/payment/success?orderId=${orderCode}&amount=${price}`
        : '/payment/success';
      const failUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/payment/fail`
        : '/payment/fail';

      await paymentWidget?.requestPayment({
        orderId: orderCode,
        orderName: orderName || "상품 구매",
        customerName: "고객",
        customerEmail: "customer@example.com",
        customerMobilePhone: "01012341234",
        successUrl: successUrl,
        failUrl: failUrl,
      });
    } catch (error) {
      console.error("Error requesting payment:", error);
      if (onNavigate) {
        onNavigate('payment-fail', { error: error.message });
      }
    }
  };

  return (
    <div className="wrapper">
      <div className="box_section">
        {/* 결제 UI, 이용약관 UI 영역 */}
        <div id="payment-widget" />
        <div id="agreement" />
        <div className="result wrapper">
          {/* 결제하기 버튼 */}
          <button
            className="button"
            style={{ marginTop: "30px" }}
            onClick={handlePaymentRequest}
          >
            결제하기
          </button>
        </div>
      </div>
    </div>
  );
}
