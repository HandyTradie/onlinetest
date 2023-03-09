/**
 * Utility to read name and email from spreadsheet paste or csv
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import { asyncUniqueBy } from '.';

export const readNameAndEmailFromSSPaste = async (
  input: string
): Promise<
  {
    name: string;
    email: string;
  }[]
> => {
  // Split input into rows - rows are separated by crlf chars (newlines)
  const rows = input.split('\n');

  // Go through each row and break up into cells - cells are separated by tabs
  const namesAndEmails = rows.map((row) => {
    // Split with tabs or commas
    const cells = row.split(/\t|,/);

    // Find index of cell with email
    // Match email with email regex
    const emailIndex = cells.findIndex((cell) => {
      const emailRegex = /^[^@]+@[^@]+\.[^@]+$/;
      return emailRegex.test(cell);
    });

    // Get email and delete from cells array
    const email = cells[emailIndex];
    cells.splice(emailIndex, 1);

    // Take one other cell as name
    const name = cells[0];

    return { name, email };
  });

  // Filter out any rows with no email or no name
  const filteredNamesAndEmails = namesAndEmails.filter(
    (nameAndEmail) => nameAndEmail.email && nameAndEmail.name
  );

  return filteredNamesAndEmails;
};

// Using mutation hook to obtain helpful utility methods
export const useReadBulkEmails = () =>
  useMutation(
    ['bulkemailutil'],
    async ({
      newData,
      prevData
    }: {
      newData: string;
      prevData: { name: string; email: string }[];
    }) => {
      const nameAndEmails = await readNameAndEmailFromSSPaste(newData);
      const uniqueNameAndEmails = await asyncUniqueBy('email', [...prevData, ...nameAndEmails]);

      return uniqueNameAndEmails;
    }
  );

const testString = `
Velda Erdman,vpohlke0@spotify.com
Ira Will,thouchin1@devhub.com
Michel Hauck,gbeals2@yandex.ru
Mohammad Aimonetti,ntulk3@columbia.edu
Theodore Daniel,mdikelin4@gmpg.org
Isobel Yundt,bpennycook5@storify.com
Darius Huels,cgraeme6@unesco.org
Delicia Gulgowski,bmccudden7@sbwire.com
Zane Hackett,skristoffersson8@smh.com.au
Ted Blanda,rgagan9@salon.com
Andrea Schaden,wfittesa@naver.com
Marlin Schowalter,cmcconnellb@phpbb.com
Randi Wehner,mwhaymanc@imgur.com
Ned Considine,ggosalvezd@de.vu
Katlyn Bartell,rdensone@angelfire.com
Murray Cummings,hbauckhamf@cocolog-nifty.com
Bryant Turcotte,icookseyg@yellowbook.com
Sherwood Zulauf,mclaeskensh@hp.com
Lewis Mayer,scampanyi@amazon.co.jp
Santiago Greenfelder,tmartinsonj@yandex.ru
Elnora Herman,asnazlek@marketwatch.com
Kenda Cronin,deveryl@yahoo.co.jp
Leanora Blick,zsimanm@biglobe.ne.jp
Kirk Glover,brivelonn@purevolume.com
Ronald Mante,cmeado@studiopress.com
Homer Kuhic,dmillardp@ezinearticles.com
Bernita Lemke,dmedhurstq@ucla.edu
Adrian Keebler,etappr@feedburner.com
Siu Mitchell,emanifolds@imgur.com
Kassandra Botsford,khullint@wikimedia.org
Ignacio Heller,twhippleu@blog.com
Lavelle Kuhn,gminkinv@slideshare.net
Nova Gorczany,htimbsw@github.io
`;
