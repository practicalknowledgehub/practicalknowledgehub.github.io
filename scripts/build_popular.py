"""Optional: GA4 Data API aggregation. Requires GA4_PROPERTY_ID and GA4_CREDENTIALS_JSON in Actions secrets."""
import os,json,datetime,re
from pathlib import Path
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest,DateRange,Dimension,Metric,OrderBy
p=os.environ['GA4_PROPERTY_ID']; credentials=json.loads(os.environ['GA4_CREDENTIALS_JSON'])
client=BetaAnalyticsDataClient(credentials=service_account.Credentials.from_service_account_info(credentials,scopes=['https://www.googleapis.com/auth/analytics.readonly']))
report=client.run_report(RunReportRequest(property='properties/'+p,date_ranges=[DateRange(start_date='30daysAgo',end_date='yesterday')],dimensions=[Dimension(name='pagePath'),Dimension(name='pageTitle')],metrics=[Metric(name='screenPageViews')],limit=10000))
counts={}
for row in report.rows:
 path=row.dimension_values[0].value.split('?')[0];title=row.dimension_values[1].value;count=int(row.metric_values[0].value)
 if re.fullmatch(r'/[a-z0-9-]+\.html',path) and path not in ['/test.html'] and len(title)>8:
  prior=counts.get(path,('',0));counts[path]=(title,prior[1]+count)
items=sorted(counts.items(),key=lambda x:-x[1][1])[:5]
if not items:raise RuntimeError('No real article view data returned; refusing to fabricate rankings')
Path('popular-articles.json').write_text(json.dumps({'period':'last_30_days','generated':datetime.date.today().isoformat(),'articles':[{'path':path,'title':data[0]} for path,data in items]},ensure_ascii=False,indent=2))
