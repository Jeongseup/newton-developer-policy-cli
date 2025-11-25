// Import the WIT import exactly like the ComponentizeJS usage pattern:
// e.g. import { log } from 'local:hello/logger' in their docs.
// Here our package is newton:provider and interface is http.
import { fetch as httpFetch } from "newton:provider/http@0.1.0";

// WIT: export run: func(input: string) -> result<string, string>
// We return a JSON string on success AND on "errors"
// (i.e., we don't surface WIT Err<string> — we encode error info in JSON)
export function run(input) {
  const { api_key, copr_code, bsns_year, reprt_code } = JSON.parse(input);
  const response = httpFetch({
    url: `https://opendart.fss.or.kr/api/fnlttSinglAcnt.json?crtfc_key=${api_key}&corp_code=${copr_code}&bsns_year=${bsns_year}&reprt_code=${reprt_code}`,
    method: "GET",
    headers: [["User-Agent", "Mozilla/5.0"]], 
    body: null
  });

  const data = JSON.parse(new TextDecoder().decode(new Uint8Array(response.body)));
  
  // Check if the API response is successful
  if (data.status !== "000") {
    return JSON.stringify({
      error: true,
      message: data.message || "API request failed"
    });
  }
  
  // Filter for "연결재무제표" and "자본총계"
  // (Consolidated Financial Statements and Total Equity)
  const targetData = data.list.find(item =>
    item.fs_nm === "연결재무제표" && item.account_nm === "자본총계"
  );
  
  if (!targetData) {
    return JSON.stringify({
      error: true,
      message: "No matching data found for 연결재무제표/자본총계"
    });
  }
  
  // Remove commas from amount
  const amount = targetData.thstrm_amount.replace(/,/g, "");
  
  // Extract date from "YYYY.MM.DD 현재" -> "YYYY-MM-DD"
  // e.g. "2025.09.30 현재" -> "2025-09-30"
  const dateMatch = targetData.thstrm_dt.match(/(\d{4})\.(\d{2})\.(\d{2})/);
  const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : targetData.thstrm_dt;

  return JSON.stringify({
    thstrm_amount: Number(amount),
    currency: targetData.currency,
    thstrm_dt: date
  });  
}