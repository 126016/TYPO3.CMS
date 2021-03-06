<?php
declare(strict_types = 1);

namespace TYPO3\CMS\Extbase\Object;

/*
 * This file is part of the TYPO3 CMS project.
 *
 * It is free software; you can redistribute it and/or modify it under
 * the terms of the GNU General Public License, either version 2
 * of the License, or any later version.
 *
 * For the full copyright and license information, please read the
 * LICENSE.txt file that was distributed with this source code.
 *
 * The TYPO3 project - inspiring people to share!
 */

use Psr\Container\ContainerInterface;
use TYPO3\CMS\Core\Utility\GeneralUtility;
use TYPO3\CMS\Extbase\Object\Container\Container as ExtbaseContainer;

/**
 * Implementation of the default Extbase Object Manager
 */
class ObjectManager implements ObjectManagerInterface
{
    /**
     * @var ContainerInterface
     */
    private $container;

    /**
     * @var ExtbaseContainer
     */
    protected $objectContainer;

    /**
     * Constructs a new Object Manager
     *
     * @param ContainerInterface $container
     * @param ExtbaseContainer $objectContainer
     */
    public function __construct(ContainerInterface $container, ExtbaseContainer $objectContainer)
    {
        $this->container = $container;
        $this->objectContainer = $objectContainer;
    }

    /**
     * Serialization (sleep) helper.
     *
     * Removes properties of this object from serialization.
     * This action is necessary, since there might be closures used
     * in the accordant content objects (e.g. in FLUIDTEMPLATE) which
     * cannot be serialized. It's fine to reset $this->contentObjects
     * since elements will be recreated and are just a local cache,
     * but not required for runtime logic and behaviour.
     *
     * @see http://forge.typo3.org/issues/36820
     * @return array Names of the properties to be serialized
     * @internal only to be used within Extbase, not part of TYPO3 Core API.
     */
    public function __sleep()
    {
        // Use get_objects_vars() instead of
        // a much more expensive Reflection:
        $properties = get_object_vars($this);
        unset($properties['objectContainer']);
        return array_keys($properties);
    }

    /**
     * Unserialization (wakeup) helper.
     *
     * Initializes the properties again that have been removed by
     * a call to the __sleep() method on serialization before.
     *
     * @see http://forge.typo3.org/issues/36820
     * @internal only to be used within Extbase, not part of TYPO3 Core API.
     */
    public function __wakeup()
    {
        $this->__construct(
            GeneralUtility::getContainer(),
            GeneralUtility::getContainer()->get(ExtbaseContainer::class)
        );
    }

    /**
     * Returns a fresh or existing instance of the object specified by $objectName.
     *
     * @param string $objectName The name of the object to return an instance of
     * @param array<int,mixed> $constructorArguments
     * @return object The object instance
     */
    public function get(string $objectName, ...$constructorArguments): object
    {
        if ($objectName === \DateTime::class) {
            return \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance($objectName, ...$constructorArguments);
        }

        if ($this->container->has($objectName)) {
            if ($constructorArguments === []) {
                $instance = $this->container->get($objectName);
                if (!is_object($instance)) {
                    throw new \TYPO3\CMS\Extbase\Object\Exception('Invalid object name "' . $objectName . '". The PSR-11 container entry resolves to a non object.', 1562357346);
                }
                return $instance;
            }
            trigger_error($objectName . ' is available in the PSR-11 container. That means you should not try to instanciate it using constructor arguments. Falling back to legacy extbase based injection.', E_USER_DEPRECATED);
        }

        return $this->objectContainer->getInstance($objectName, $constructorArguments);
    }

    /**
     * Create an instance of $className without calling its constructor
     *
     * @param string $className
     * @return object
     */
    public function getEmptyObject(string $className): object
    {
        return $this->objectContainer->getEmptyObject($className);
    }
}
