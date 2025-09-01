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

			<div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">

				<div className="bg-white p-8 border-b border-gray-200">
					<div className="flex items-start justify-between mb-8">

						<div className="flex items-start space-x-4">
							<img
								src='https://pub-875dbce2129e4038b9a711526553d647.r2.dev/tti/letterhead-english.png'
								width='100%'
								alt='Timothy Training International, Logo'
							/>
						</div>
					</div>


					<div className="text-center mb-8">
						<h4 className="text-xl font-bold text-gray-800 mb-2">Donation Receipt (#{details.invoiceNumber})</h4>
						<p className="text-md text-gray-600">
							{new Date(details.invoiceDate).toLocaleDateString("en-US", DATE_OPTIONS)}
						</p>
					</div>

					<div className="space-y-4">
						<div>
							<h3 className="font-semibold text-gray-800 mb-2">Donor's address:</h3>
							<div className="text-gray-600 border-b border-gray-300 pb-4">
								<p>{receiver.name}</p>
								<p>{receiver.address && receiver.address.length > 0 ? receiver.address : null}</p>
								<p>{receiver.city} {receiver.zipCode && receiver.zipCode.length > 0 ? `${receiver.zipCode}` : null}</p>
								<p>{receiver.country}</p>
							</div>
						</div>
					</div>

					<div className="space-y-4 py-6">
						<p className="text-gray-800">Dear {receiver.name},</p>
						
						<div className="space-y-3 text-gray-800 leading-relaxed">
							<p>
								Thank you for your donation. This is a receipt for your gracious donation to Timothy Training 
								International, NFP. <span className="font-semibold text-red-600">TTI</span> is a non-profit under section 501 (c) (3) of the Internal Revenue 
								Code. Contributions to <span className="font-semibold text-red-600">TTI</span> are tax-exempt in the U.S.A. Please keep this receipt for 
								your record. No goods or services were given to you by <span className="font-semibold text-red-600">TTI</span> in exchange for your donation.
							</p>
						</div>
					</div>

					<div className="bg-gray-50 p-2 rounded-lg">
						<p className="font-semibold text-gray-800 mb-4">
							Donation amount: {formatNumberWithCommas(Number(details.totalAmount))} {details.currency}
							<br />
							Received via: {details.paymentInformation?.bankName} ({details.paymentInformation?.accountName})
							<br />
							Received at: {new Date(details.dueDate).toLocaleDateString("en-US", DATE_OPTIONS)}
						</p>
					</div>

					<div className="py-2 space-y-4">
						
						<div className="pt-8">
							<p className="text-gray-800">Blessings in Christ,</p>
							<p className="font-semibold text-gray-800">Rev. Janson Chan</p>
							<p className="text-gray-600">Executive Director</p>
						</div>
						
						<div className="pt-4 text-center">
							<p className="font-semibold text-gray-800">IRS Tax Number 26-2901737</p>
						</div>
					</div>

					<div className="text-center space-y-2 text-sm text-gray-700">
						<img 
							src='https://pub-875dbce2129e4038b9a711526553d647.r2.dev/tti/letterfoot-english.png'
							width='100%'
							alt='Timothy Training International, Logo'
						/>
					</div>
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
