import React from "react";

// Components
import { InvoiceLayout } from "@/app/components";

// Helpers
import { formatNumberWithCommas, isDataUrl } from "@/lib/helpers";

// Variables
import { DATE_OPTIONS } from "@/lib/variables";

// Types
import { InvoiceType } from "@/types";

const InvoiceTemplate = (data: InvoiceType) => {
	const { sender, receiver, details } = data;

	return (
		<InvoiceLayout data={data}>
			<div className='flex justify-between'>
				<div>
					{details.invoiceLogo && (
						<img
							src='https://endao.vip/assets/images/logo.png'
							width={140}
							height={100}
							alt={`Logo of ${sender.name}`}
						/>
					)}
					<h1 className='mt-2 text-lg md:text-xl font-semibold text-blue-600'>Inspirata Publishing</h1>
					<h1 className='mt-2 text-lg md:text-xl font-semibold text-blue-600'>(Hong Kong) Limited</h1>
				</div>
				<div className='text-right'>
					<h2 className='text-2xl md:text-3xl font-semibold text-gray-800'>Donation Receipt #</h2>
					<span className='mt-1 block text-gray-500'>{details.invoiceNumber}</span>
					<address className='mt-4 not-italic text-gray-800'>
						Flat D, 9/F, Metex House, 24-32 Fui Yiu Kok St.， Tsuen Wan, Hong Kong
						<br />
						Phone：（852） 3188 5591
						<br />
						Fax：（852） 3585 0400
						<br />
					</address>
				</div>
			</div>

			<div className='mt-6 grid sm:grid-cols-2 gap-3'>
				<div>
					<h3 className='text-lg font-semibold text-gray-800'>Donor Information:</h3>
					<h3 className='text-lg font-semibold text-gray-800'>{receiver.name}</h3>
					{}
					<address className='mt-2 not-italic text-gray-500'>
						{receiver.address && receiver.address.length > 0 ? receiver.address : null}
						{receiver.zipCode && receiver.zipCode.length > 0 ? `, ${receiver.zipCode}` : null}
						<br />
						{receiver.city}, {receiver.country}
						<br />
					</address>
				</div>

				<div className='sm:text-right space-y-2'>
					<div className='grid grid-cols-2 sm:grid-cols-1 gap-3 sm:gap-2'>
						<dl className='grid sm:grid-cols-6 gap-x-3'>
							<dt className='col-span-3 font-semibold text-gray-800'>Date:</dt>
							<dd className='col-span-3 text-gray-500'>
								{new Date(details.invoiceDate).toLocaleDateString("en-US", DATE_OPTIONS)}
							</dd>
						</dl>
						<dl className='grid sm:grid-cols-6 gap-x-3'>
							<dt className='col-span-3 font-semibold text-gray-800'>Total:</dt>
							<dd className='col-span-3 text-gray-500'>
								{formatNumberWithCommas(Number(details.totalAmount))} {details.currency}
							</dd>
						</dl>
					</div>
				</div>
			</div>

			<div>
				<div className='my-4'>
					<div className='my-2'>
						<span className='font-semibold text-md text-gray-800'>
							<p className='text-sm'>
								This is a receipt for your gracious donation to Inspirata Publishing （Hong Kong） Limited. Your support is deeply appreciated and makes a significant difference in our mission.</p>
							<p className='text-sm'>
								Inspirata Publishing is a nonprofit under Section 88 of the Inland Revenue Ordinance. Donations to Inspirata Publishing are tax-exemptible in Hong Kong. Please keep this receipt for your record. No goods or services were given to you by Inspirata Publishing in exchange for your donation.</p>
						</span>
					</div>
				</div>
			</div>
			

			<div>
				<div className='my-4'>
					<div className='my-2'>
						<p className='font-semibold text-blue-600'>Additional notes:</p>
						<p className='font-regular text-gray-800'>{details.additionalNotes}</p>
					</div>
				</div>
				<p className='text-gray-500 text-sm'>
					If you have any questions concerning this invoice, use the following contact information:
				</p>
				<div>
					<p className='block text-sm font-medium text-gray-800'>mk@endao.co</p>
				</div>
			</div>

			{/* Signature */}
			{details?.signature?.data && isDataUrl(details?.signature?.data) ? (
				<div className='mt-6'>
					<p className='font-semibold text-gray-800'>Signature:</p>
					<img
						src={details.signature.data}
						width={120}
						height={60}
						alt={`Signature of ${sender.name}`}
					/>
				</div>
			) : details.signature?.data ? (
				<div className='mt-6'>
					<p className='text-gray-800'>Signature:</p>
					<p
						style={{
							fontSize: 30,
							fontWeight: 400,
							fontFamily: `${details.signature.fontFamily}, cursive`,
							color: "black",
						}}
					>
						{details.signature.data}
					</p>
				</div>
			) : null}
		</InvoiceLayout>
	);
};

export default InvoiceTemplate;
