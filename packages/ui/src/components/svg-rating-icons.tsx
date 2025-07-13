/** ======== STAR ======== */
export function SVGStarFill(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M18.75 7.69221L12.5925 6.95272L9.99671 1.25L7.40096 6.95272L1.25 7.69221L5.7975 11.9626L4.59491 18.125L9.99671 15.0538L15.4051 18.125L14.2025 11.9626L18.75 7.69221Z'
        fill='currentColor'
      />
    </svg>
  );
}

export function SVGStarHalf(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M18.75 7.69476L12.5925 6.95497L9.99671 1.25L7.40096 6.95497L1.25 7.69476L5.7975 11.9602L4.58834 18.125L9.99671 15.0526L15.4051 18.125L14.1959 11.9602L18.7434 7.69476H18.75ZM10.0033 13.533V4.43572L11.7119 8.19461L15.7665 8.68113L12.7699 11.4936L13.5651 15.5524L10.0033 13.533Z'
        fill='currentColor'
      />
    </svg>
  );
}

export function SVGStarLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M15.4117 18.125L10.0033 15.0526L4.59491 18.125L5.80407 11.9602L1.25 7.69476L7.40096 6.95498L9.99671 1.25L12.5925 6.95498L18.75 7.69476L14.2025 11.9602L15.4117 18.125ZM10.0033 13.5264L13.5651 15.5458L12.7699 11.487L15.7665 8.67447L11.7119 8.18794L10.0033 4.42906L8.29469 8.18794L4.24005 8.67447L7.23667 11.487L6.44151 15.5458L10.0033 13.5264Z'
        fill='currentColor'
      />
    </svg>
  );
}

export function StarRating({ rating }: { rating: number }) {
  const getStarIcon = (i: number) => {
    if (rating >= i + 1) {
      return <SVGStarFill className='size-5 text-yellow-500' key={i} />;
    } else if (rating >= i + 0.5) {
      return <SVGStarHalf className='size-5 text-yellow-500' key={i} />;
    }
    return <SVGStarLine className='size-5 text-stroke-sub-300' key={i} />;
  };

  return (
    <div className='flex gap-0.5'>
      {Array.from({ length: 5 }, (_, i) => getStarIcon(i))}
    </div>
  );
}

/** ======== HEART ======== */
export function SVGHeartFill(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M13.375 3.125C15.6535 3.125 17.5 4.98311 17.5 7.58446C17.5 12.7872 11.875 15.7601 10 16.875C8.125 15.7601 2.5 12.7872 2.5 7.58446C2.5 4.98311 4.375 3.125 6.625 3.125C8.02 3.125 9.25 3.86824 10 4.61149C10.75 3.86824 11.98 3.125 13.375 3.125Z'
        fill='currentColor'
      />
    </svg>
  );
}

export function SVGHeartHalf(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M13.375 3.125C12.2 3.125 10.9438 3.68226 10.0063 4.61521C9.06875 3.68226 7.8 3.125 6.625 3.125C4.3125 3.125 2.5 5.08481 2.5 7.59563C2.5 9.81216 3.525 11.8909 5.55 13.7881C7 15.1469 8.5875 16.0798 9.6875 16.7185L10.0437 16.875L10.3562 16.6934C11.3438 16.1174 13 15.1469 14.45 13.7881C16.475 11.8972 17.5 9.81216 17.5 7.59563C17.5 5.04724 15.725 3.125 13.375 3.125ZM13.6 12.8677C12.4 13.9948 11.0312 14.815 10.0063 15.4224C10.0438 13.688 10.0312 8.6538 10.0063 6.36214L10.8813 5.50433C11.15 5.24135 12.1125 4.37728 13.375 4.37728C15.0125 4.37728 16.25 5.76104 16.25 7.59563C16.25 9.43021 15.3562 11.221 13.6 12.8677Z'
        fill='currentColor'
      />
    </svg>
  );
}

export function SVGHeartLine(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox='0 0 20 20'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
      {...props}
    >
      <path
        d='M10.0437 16.875L9.6875 16.7185C8.5875 16.0735 7 15.1406 5.55 13.7881C3.525 11.8909 2.5 9.8059 2.5 7.59563C2.5 5.08481 4.3125 3.125 6.625 3.125C7.8 3.125 9.0625 3.68226 10 4.61521C10.9375 3.68226 12.2 3.125 13.375 3.125C15.725 3.125 17.5 5.04724 17.5 7.59563C17.5 9.81216 16.475 11.8909 14.45 13.7881C13 15.1469 11.3438 16.1174 10.3562 16.6934L10.0437 16.875ZM6.625 4.37728C4.9875 4.37728 3.75 5.76104 3.75 7.59563C3.75 9.43021 4.64375 11.221 6.4 12.8677C7.63125 14.0198 9.00625 14.8651 10 15.4474C11.0312 14.8401 12.3813 14.0073 13.6 12.8677C15.3562 11.221 16.25 9.449 16.25 7.59563C16.25 5.74226 15.0125 4.37728 13.375 4.37728C12.1125 4.37728 11.1438 5.24135 10.8813 5.50433L10 6.37466L9.11875 5.50433C8.85 5.24135 7.8875 4.37728 6.625 4.37728Z'
        fill='currentColor'
      />
    </svg>
  );
}
