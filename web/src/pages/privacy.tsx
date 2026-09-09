import React, {FC} from 'react';
import {Box, HeadingL, HeadingS, Typography} from 'components';
import {useTheme} from 'styled-components';
import Link from 'next/link';

const Privacy: FC = () => {
  const {spacing} = useTheme();

  return (
    <Box display="flex" justifyContent="center" paddingTop={80}>
      <Box padding={spacing.scale500} display="grid" rowGap={spacing.scale300} maxWidth="800px">
        <HeadingL style={{marginTop: 0}}>Datenschutzerklärung </HeadingL>
        <Typography kind="secondary">Stand: November 2020</Typography>
        <Typography>
          Der Schutz Ihrer persönlichen Daten ist uns ein besonderes Anliegen. Wir verarbeiten Ihre
          Daten daher ausschließlich auf Grundlage der gesetzlichen Bestimmungen (DSGVO, TKG 2003).
          In diesen Datenschutzinformationen informieren wir Sie über die wichtigsten Aspekte der
          Datenverarbeitung im Rahmen unserer Website. <br />
          Beim Besuch unserer Webseite wird Ihre IP-Adresse, Beginn und Ende der Sitzung für die
          Dauer dieser Sitzung erfasst. Dies ist technisch bedingt und stellt damit ein berechtigtes
          Interesse iSv Art 6 Abs 1 lit f DSGVO dar. Soweit im Folgenden nichts anderes geregelt
          wird, werden diese Daten von uns nicht weiterverarbeitet.
        </Typography>
        <HeadingS>Verantwortliche</HeadingS>
        <Typography>
          Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen
          Kontaktdaten können Sie dem <Link href="/impressum">Impressum</Link> dieser Website
          entnehmen.
        </Typography>
        <HeadingS>Ihre Rechte</HeadingS>
        <Typography>
          Ihnen stehen bezüglich Ihrer bei uns gespeicherten Daten grundsätzlich die Rechte auf
          Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerruf und
          Widerspruch zu. Wenn Sie glauben, dass die Verarbeitung Ihrer Daten gegen das
          Datenschutzrecht verstößt oder Ihre datenschutzrechtlichen Ansprüche sonst in einer Weise
          verletzt worden sind, können Sie bei der österreichischen Datenschutzbehörde, welche unter{' '}
          <a href="https://www.dsb.gv.at/" target="_blank" rel="noopener noreferrer">
            https://www.dsb.gv.at/
          </a>{' '}
          zu finden ist, beschweren.
        </Typography>
        <HeadingS>TLS-Verschlüsselung</HeadingS>
        <Typography>
          Wir verwenden https um Daten abhörsicher im Internet zu übertragen
          <a href="https://eur-lex.europa.eu/legal-content/DE/TXT/HTML/?uri=CELEX:32016R0679&from=DE&tid=121248723">
            (Datenschutz durch Technikgestaltung Artikel 25 Absatz 1 DSGVO).
          </a>{' '}
          Durch den Einsatz von TLS (Transport Layer Security), einem Verschlüsselungsprotokoll zur
          sicheren Datenübertragung im Internet können wir den Schutz vertraulicher Daten
          sicherstellen. Sie erkennen die Benutzung dieser Absicherung der Datenübertragung am
          kleinen Schlosssymbol links oben im Browser und der Verwendung des Schemas https (anstatt
          http) als Teil unserer Internetadresse.
        </Typography>
        <HeadingS>Externes Hosting</HeadingS>
        <Typography>
          Wir nutzen die Dienste von Heroku (Der Service wird von Salesforce.com, Inc., San
          Francisco, California 94105, angeboten). Die von uns genutzten Server befinden sich in
          Dublin. Weitere Informationen zur Datennutzung durch Heroku erhalten Sie in der
          Datenschutzerklärung von Heroku:{' '}
          <a
            href="https://www.salesforce.com/company/privacy/"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://www.salesforce.com/company/privacy/
          </a>{' '}
          . Rechtsgrundlage ist unser berechtigtes Interesse des Betriebes und des Erhalts der
          Betriebssicherheit dieser Webseiten gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO.
          <br />
          <br />
          Das Frontend dieser Website selbst wird auf Servern von Netlify, Inc., 2325 3rd Street,
          Suite 215, San Francisco, 94107 CA, USA, („NF“) gehostet. Das Hosting erfolgt dabei
          außerhalb der EU. Über die weitere Art der Verarbeitung sowie über die Dauer der
          Speicherung der Daten haben wir keine Kenntnis. Näher Informationen finde Sie unter{' '}
          <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">
            https://www.netlify.com/privacy/
          </a>
          Rechtsgrundlage ist unser berechtigtes Interesse des Betriebes und des Erhalts der
          Betriebssicherheit dieser Webseiten gemäß Art. 6 Abs. 1 S. 1 lit. f DSGVO.
        </Typography>
        <HeadingS>Datenspeicherung</HeadingS>
        <Typography>
          Für die Dantenspeicherung verwenden wir Dienste von Amazon Web Services, Inc., 410 Terry
          Avenue North, Seattle WA 98109, USA, („AWS“).
          <br />
          Zusätzlich greifen wir für die Speicherung von Dokumente, welche sowhol direkt auf der
          Website als auch über ein von icruiting bereitgesteltes Bewerbungs-Formular hochgeladen
          werden auf das Produkte „S3“ von AWS zurück. Dabei erfolgt die Verabeitung und Speicherung
          ausschließlich im AWS-Rechenzentrum in Frankfurt a.M. AWS ist ferner
          Privacy-Shield-zertifiziert und garantiert damit, auch außerhalb des europäischen
          Wirtschaftsraums die personenbezogenen Daten entsprechend europäischer Datenschutzgesetze
          zu verarbeiten.
          <br />
          Die Einbeziehung von AWS und Heroku erfolgt auf Grundlage unserer berechtigten Interesse
          des Betriebes und des Erhalts der Betriebssicherheit dieser Webseiten gem. Art. 6 Abs. 1
          lit. f. DS-GVO.
        </Typography>
        <HeadingS>Zahlungen</HeadingS>
        <Typography>
          Bei der Zahlung mittels Lastschriftverfahren erfolgt die Zahlungsabwicklung über Dienste
          des Zahlungsdienstleisters Stripe Payments Europe Ltd, Block 4, Harcourt Centre, Harcourt
          Road, Dublin 2, Irland. Nähere Informationen zum Datenschutz von Stripe finden Sie unter
          https://stripe.com/de/privacy#translation.
        </Typography>
        <HeadingS>Registrierung, Anmeldung, Nutzerkonto</HeadingS>
        <Typography>
          Wir verwenden Amazon Cognito von AWS für Authorisierungsdienste. Dafür werden die im Zuge
          der Registrierung sowie dem Login angegebene Daten (Name, E-Mail-Adresse, Passwort) AWS
          übermitelt. Hierbei werden die empfangenen Daten in Frankfurt abgespeichert. Nähere
          Informationen finden Sie auf{' '}
          <a href="https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html">
            https://docs.aws.amazon.com/cognito/latest/developerguide/data-protection.html
          </a>
          . Rechtsgrundlage für die Einbeziehung von AWS Cognito ist unser berechtigtes Interesse
          des Betriebes und des Erhalts der Betriebssicherheit dieser Webseiten gemäß Art. 6 Abs. 1
          S. 1 lit. f DSGVO.
        </Typography>
        <HeadingS>Einsatz von Segment.io</HeadingS>
        <Typography>
          Diese Website verwendet Software der Segment.io, Inc. 101 15th St San Francisco, CA 94103
          USA. Um unser Angebot kontinuierlich zu verbessern und zu optimieren, nutzen wir
          Segment.io Analytics, um das Nutzerverhalten auf unserer Webseite zu analysieren und
          statistische Daten zu erheben Dabei werden Informationen über die Benutzung der Webseite,
          wie besuchte Seiten, Verweildauer oder technische Daten wie Browser und Betriebssystem,
          erfasst und an Segment.io übermittelt. Rechtsgrundlage für die Verarbeitung ist Art. 6
          Abs. 1 UAbs. 1 Buchst. f) DSGVO. Unser berechtigtes Interesse besteht in der Verbesserung
          unserer Webseite und der Inhalte. Diese Daten werden anonymisiert und können nicht direkt
          einer bestimmten Person zugeordnet werden. Segment.io verwendet Cookies, die auf Ihrem
          Endgerät gespeichert werden und die eine Analyse Ihrer Nutzung der Webseite ermöglichen.
          Die durch den Cookie erzeugten Informationen werden in der Regel an einen Server von
          Segment.io in den USA übertragen und dort gespeichert. Sie können die Erfassung und
          Verarbeitung Ihrer Daten durch Segment.io verhindern, indem Sie in Ihren
          Browsereinstellungen das Speichern von Cookies deaktivieren oder ein Browser-Add-on zur
          Deaktivierung von Segment.io verwenden. Weitere Informationen zum Datenschutz und Ihren
          diesbezüglichen Rechten finden Sie in den Datenschutzbestimmungen von Segment.io unter
          <a href="https://segment.com/docs/legal/privacy/">
            https://segment.com/docs/legal/privacy/
          </a>
        </Typography>
      </Box>
    </Box>
  );
};

export default Privacy;
