import { escapePlantUmlString } from './PlantUmlString.mjs';

const ElementType = {
  Strategy_Resource: 'Strategy_Resource',
  Strategy_Capability: 'Strategy_Capability',
  Strategy_CourseOfAction: 'Strategy_CourseOfAction',
  Strategy_ValueStream: 'Strategy_ValueStream',
  Business_Actor: 'Business_Actor',
  Business_Role: 'Business_Role',
  Business_Collaboration: 'Business_Collaboration',
  Business_Interface: 'Business_Interface',
  Business_Process: 'Business_Process',
  Business_Function: 'Business_Function',
  Business_Interaction: 'Business_Interaction',
  Business_Event: 'Business_Event',
  Business_Service: 'Business_Service',
  Business_Object: 'Business_Object',
  Business_Contract: 'Business_Contract',
  Business_Representation: 'Business_Representation',
  Business_Product: 'Business_Product',
  Business_Location: 'Business_Location',
  Application_Component: 'Application_Component',
  Application_Collaboration: 'Application_Collaboration',
  Application_Interface: 'Application_Interface',
  Application_Function: 'Application_Function',
  Application_Interaction: 'Application_Interaction',
  Application_Process: 'Application_Process',
  Application_Event: 'Application_Event',
  Application_Service: 'Application_Service',
  Application_DataObject: 'Application_DataObject',
  Technology_Node: 'Technology_Node',
  Technology_Device: 'Technology_Device',
  Technology_SystemSoftware: 'Technology_SystemSoftware',
  Technology_Collaboration: 'Technology_Collaboration',
  Technology_Interface: 'Technology_Interface',
  Technology_Path: 'Technology_Path',
  Technology_CommunicationNetwork: 'Technology_CommunicationNetwork',
  Technology_Function: 'Technology_Function',
  Technology_Process: 'Technology_Process',
  Technology_Interaction: 'Technology_Interaction',
  Technology_Event: 'Technology_Event',
  Technology_Service: 'Technology_Service',
  Technology_Artifact: 'Technology_Artifact',
  Physical_Equipment: 'Physical_Equipment',
  Physical_Facility: 'Physical_Facility',
  Physical_DistributionNetwork: 'Physical_DistributionNetwork',
  Physical_Material: 'Physical_Material',
  Motivation_Stakeholder: 'Motivation_Stakeholder',
  Motivation_Driver: 'Motivation_Driver',
  Motivation_Assessment: 'Motivation_Assessment',
  Motivation_Goal: 'Motivation_Goal',
  Motivation_Outcome: 'Motivation_Outcome',
  Motivation_Principle: 'Motivation_Principle',
  Motivation_Requirement: 'Motivation_Requirement',
  Motivation_Constraint: 'Motivation_Constraint',
  Motivation_Meaning: 'Motivation_Meaning',
  Motivation_Value: 'Motivation_Value',
  Implementation_WorkPackage: 'Implementation_WorkPackage',
  Implementation_Deliverable: 'Implementation_Deliverable',
  Implementation_Event: 'Implementation_Event',
  Implementation_Plateau: 'Implementation_Plateau',
  Implementation_Gap: 'Implementation_Gap',
  Other_Location: 'Other_Location',
  Junction_Or: 'Junction_Or',
  Junction_And: 'Junction_And',
  Grouping: 'Grouping',
  Group: 'Group',
} as const;

type ElementTypeKey = keyof typeof ElementType;
export type ArchimateElementType = (typeof ElementType)[ElementTypeKey];

export function isArchimateElementType(type: string): type is ArchimateElementType {
  return Object.values(ElementType).includes(type as ArchimateElementType);
}

/** Archimate-PlantUML procedures that take only `($alias, $label)`, without `$nest`. */
const typesWithoutNestParameter: ReadonlySet<string> = new Set([
  ElementType.Grouping,
  ElementType.Group,
  ElementType.Junction_Or,
  ElementType.Junction_And,
]);

/** Element types that cannot contain other elements (they never render with a `{ }` block). */
const typesWithoutChildren: ReadonlySet<string> = new Set([
  ElementType.Junction_Or,
  ElementType.Junction_And,
]);

/** Whether elements of this type can contain nested elements. */
export function canContainElements(type: ArchimateElementType): boolean {
  return !typesWithoutChildren.has(type);
}

/**
 * Writes an element procedure call. Pass `nest = true` for an element that
 * opens a `{ }` block: the call then passes `$nest = 1`, so the stdlib draws
 * a container instead of a special shape (actor, process, ...) that cannot
 * hold children.
 */
function ArchimateElement(
  type: ArchimateElementType,
  alias: string,
  label: string,
  nest = false,
): string {
  const nestArgument = nest && !typesWithoutNestParameter.has(type) ? ', 1' : '';
  return `${type}("${escapePlantUmlString(alias)}", "${escapePlantUmlString(label)}"${nestArgument})`;
}

ArchimateElement.type = ElementType;

export { ArchimateElement };
